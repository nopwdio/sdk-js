import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { link } from "../internal/styles/semantic.styles.js";
import styles from "./np-status.styles.js";
import { loading, warning, circleSolid, wifiOff } from "../internal/styles/icons.styles.js";

import { Status } from "../core/status.js";
import { wait } from "../internal/util/wait.js";

export enum State {
  OPERATIONAL = "operational",
  DISRUPTED = "disrupted",
  DOWN = "down",
  UNKNOWN = "unknown",
  NODATA = "nodata",
  OFFLINE = "offline",
}

const UPDATE_DURATION = 2000;

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
  @property({ reflect: true }) state: State = State.UNKNOWN;
  private ws?: WebSocket;
  private updateTimeoutId?: number;

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    this.style.setProperty("--update-duration", `${UPDATE_DURATION}ms`);
    this.connect();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.disconnect();
  }

  private async connect() {
    if (this.state !== State.OFFLINE) {
      this.state = State.UNKNOWN;
    }

    const base = "wss://ws-a5hdgaocga-uc.a.run.app";
    const scope = this.getAttribute("scope");

    const path = scope === null ? `${base}/status` : `${base}/status/${scope}`;
    this.ws = new WebSocket(path);

    this.ws.onmessage = (event) => {
      const status = JSON.parse(event.data) as Status;
      if (status.success_count + status.error_count === 0) {
        this.state = State.NODATA;
        return;
      }

      if (status.success_count === 0) {
        this.state = State.DOWN;
        return;
      }

      if (status.error_count > 0) {
        this.state = State.DISRUPTED;
        return;
      }

      this.state = State.OPERATIONAL;
      this.signalUpdate();
    };

    this.ws.onclose = async () => {
      this.state = State.OFFLINE;

      if (this.isConnected) {
        await wait(1000);
        this.connect();
      }
    };
  }

  private disconnect() {
    this.state = State.OFFLINE;
    this.ws?.close();
  }

  private signalUpdate() {
    window.clearTimeout(this.updateTimeoutId);
    this.setAttribute("updated", "");
    window.setTimeout(() => this.removeAttribute("updated"), UPDATE_DURATION);
  }

  // Render the UI as a function of component state
  render() {
    return html`<a href="https://nopwd.io/status" part="link">
      ${this.state === State.DOWN
        ? html`${warning} Service is down`
        : this.state === State.NODATA
        ? html`${warning} No data`
        : this.state === State.DISRUPTED
        ? html`${warning} Some systems disrupted`
        : this.state === State.OPERATIONAL
        ? html`${circleSolid} All systems operational`
        : this.state === State.OFFLINE
        ? html`${wifiOff} offline`
        : html`${loading}<slot>connecting...</slot>`}
    </a>`;
  }

  static styles = [core, link, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}
