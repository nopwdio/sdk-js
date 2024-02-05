import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { link } from "../internal/styles/semantic.styles.js";
import styles from "./np-status.styles.js";
import {
  loading,
  warning,
  wifiOff,
  checkCircle,
  circleSolid,
} from "../internal/styles/icons.styles.js";

import { getStore } from "../internal/api/firestore.js";
import { doc, onSnapshot } from "firebase/firestore";

interface Status {
  last_success: number;
  last_error: number;
}

export enum State {
  OPERATIONAL = "operational",
  DISRUPTED = "disrupted",
  DOWN = "down",
}

/**
 * @summary Nopwd Status component
 *
 * @slot - The default label.
 * @slot operational - all services are working.
 * @slot disrupted - some error occured last 24h.
 * * @slot down - an error occured no success since last hour.
 *
 * @csspart link - The component's link wrapper.
 */
@customElement("np-status")
export class NpStatus extends LitElement {
  @property({ type: Object }) status?: Status;
  @property({ reflect: true }) state?: State;

  private unsub?: () => void;
  private refreshIntervalId?: number;

  async connectedCallback() {
    super.connectedCallback();

    this.updateState = this.updateState.bind(this);

    window.addEventListener("online", this.updateState, true);
    window.addEventListener("offline", this.updateState, true);

    // needed if status has no update anymore
    this.refreshIntervalId = window.setInterval(this.updateState, 60 * 1000);

    this.start();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener("online", this.updateState, true);
    window.removeEventListener("offline", this.updateState, true);

    this.stop();
  }

  private updateState() {
    const now = Date.now() / 1000;

    if (!navigator.onLine || this.status === undefined) {
      this.removeAttribute("state");
      return;
    }

    if (this.status.last_error && now - this.status.last_error < 3600) {
      this.setAttribute("state", State.DOWN);
      return;
    }

    if (this.status.last_error && now - this.status.last_error < 24 * 3600) {
      this.setAttribute("state", State.DISRUPTED);
      return;
    }

    if (this.status.last_success && now - this.status.last_success < 3600) {
      this.setAttribute("state", State.OPERATIONAL);
      return;
    }

    this.setAttribute("state", State.DOWN);
  }

  private start() {
    this.updateState();
    const db = getStore();

    let healthDoc = doc(db, "api.v0", "health");
    this.unsub = onSnapshot(healthDoc, (doc) => {
      this.status = doc.data() as Status;
      this.updateState();
    });
  }

  private stop() {
    this.unsub && this.unsub();
    this.unsub = undefined;

    this.refreshIntervalId && clearInterval(this.refreshIntervalId);
    this.refreshIntervalId = undefined;

    this.status = undefined;
    this.state = undefined;
  }

  // Render the UI as a function of component state
  render() {
    return html`<a href="https://nopwd.io/status" part="link">
      ${this.state === State.DOWN
        ? html`${warning} Service is down`
        : this.state === State.DISRUPTED
        ? html`${warning} Some systems disrupted`
        : this.state === State.OPERATIONAL
        ? html`${circleSolid} All systems operational`
        : html`${loading} <slot>API status</slot>`}
    </a>`;
  }

  static styles = [core, link, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}
