import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { link } from "../internal/styles/semantic.styles.js";
import styles from "./np-status.styles.js";
import {
  loading,
  warning,
  checkSolid,
  wifiOff,
  checkCircle,
  exclamationCircle,
  checkCircleSolid,
  exclamationCircleSolid,
} from "../internal/styles/icons.styles.js";

import { AbortError, NoPwdError } from "../internal/api/errors.js";
import { get, revoke } from "../core/session.js";
import { getStore } from "../internal/api/firestore.js";
import { collection, doc, onSnapshot } from "firebase/firestore";

interface Status {
  lastSuccess: number;
  lastError: number;
}

export enum State {
  INITIALIZING = "initializing",
  DISCONNECTED = "disconnected",
  OPERATIONAL = "operational",
  DISRUPTED = "disrupted",
  DOWN = "down",
}

/**
 * @summary Nopwd Status component
 *
 * @slot - The default label.
 * @slot loggingout - revoking the user session.
 * @slot loggedout - session is revoked.
 *
 * @csspart button - The component's button wrapper.
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

    window.addEventListener("online", this.updateState);
    window.addEventListener("offline", this.updateState);

    // needed if status has no update anymore
    this.refreshIntervalId = window.setInterval(this.updateState, 60 * 1000);

    this.start();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();

    window.removeEventListener("online", this.updateState);
    window.removeEventListener("offline", this.updateState);
  }

  private updateState() {
    const now = Date.now() / 1000;

    if (!navigator.onLine) {
      this.setAttribute("state", State.DISCONNECTED);
      return;
    }

    if (this.status === undefined) {
      this.setAttribute("state", State.INITIALIZING);
      return;
    }

    if (this.status.lastError && now - this.status.lastError < 3600) {
      this.setAttribute("state", State.DOWN);
      return;
    }

    if (this.status.lastError && now - this.status.lastError < 24 * 3600) {
      this.setAttribute("state", State.DISRUPTED);
      return;
    }

    if (this.status.lastSuccess && now - this.status.lastSuccess < 3600) {
      this.setAttribute("state", State.OPERATIONAL);
      return;
    }

    this.setAttribute("state", State.DOWN);
  }

  private start() {
    this.updateState();
    const db = getStore();

    let healthDoc = doc(db, "api", "health");
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
    return html` <a href="https://nopwd.io/status">
      ${this.state === State.DISCONNECTED
        ? html`${wifiOff} Not connected`
        : this.state === State.INITIALIZING
        ? html`${loading} Getting status...`
        : this.state === State.DISRUPTED
        ? html`${exclamationCircleSolid} Some systems disrupted`
        : this.state === State.OPERATIONAL
        ? html`${checkCircleSolid} All systems operational`
        : html`${warning} Service is down`}
    </a>`;
  }

  static styles = [core, link, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}
