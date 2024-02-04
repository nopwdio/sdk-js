import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { link } from "../internal/styles/semantic.styles.js";
import styles from "./np-status.styles.js";
import { loading, warning, wifiOff, checkCircle } from "../internal/styles/icons.styles.js";

import { getStore } from "../internal/api/firestore.js";
import { doc, onSnapshot } from "firebase/firestore";

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
  @property({ type: Boolean }) connected: boolean = true;

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
    if (this.state === State.DISCONNECTED) {
      return html`<a href="https://nopwd.io/status">${wifiOff} Not connected</a>`;
    }
    if (this.state === State.DOWN) {
      return html`<a href="https://nopwd.io/status">${warning} Service is down</a>`;
    }
    if (this.state === State.DISRUPTED) {
      return html`<a href="https://nopwd.io/status">${warning} Some systems disrupted</a>`;
    }
    if (this.state === State.OPERATIONAL) {
      return html`<a href="https://nopwd.io/status">${checkCircle} All systems operational</a>`;
    }

    if (this.state === State.INITIALIZING) {
      return html`<a href="https://nopwd.io/status">${loading} fetching data...</a>`;
    }

    return html`<a href="https://nopwd.io/status">nopwd API status</a>`;
  }

  static styles = [core, link, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}