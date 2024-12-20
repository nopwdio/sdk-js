import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
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

/**
 * @summary `np-status` is a custom element that displays the current health status of the nopwd API.
 *
 * @description
 * This component connects to a WebSocket to receive real-time status updates and displays
 * the current state of the nopwd API.
 * The possible states are:
 * - `operational`: All systems are functioning correctly.
 * - `disrupted`: Some errors occurred in the last 24 hours.
 * - `down`: No successful responses in the last hour.
 * - `nodata`: Insufficient data to determine status.
 * - `offline`: Unable to connect to the service.
 * - `unknown`: The status is currently unknown.
 *
 * @slot - The default slot for the label.
 * @slot operational - Content displayed when all services are operational.
 * @slot disrupted - Content displayed when some errors occurred in the last 24 hours.
 * @slot down - Content displayed when no successful responses in the last hour.
 * @slot nodata - Content displayed when there is insufficient data to determine status.
 * @slot offline - Content displayed when unable to connect to the service.
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

  // Render the UI as a function of component state
  render() {
    return html`<a href="https://nopwd.io/status" part="link">
      ${this.state === State.DOWN
        ? html`${warning} <slot name="down">Service is down</slot>`
        : this.state === State.NODATA
        ? html`${warning} <slot name="nodata">No data</slot>`
        : this.state === State.DISRUPTED
        ? html`${warning} <slot name="disrupted">Some systems disrupted</slot>`
        : this.state === State.OPERATIONAL
        ? html`${circleSolid} <slot name="operational">All systems operational</slot>`
        : this.state === State.OFFLINE
        ? html`${wifiOff} <slot name="offline">Offline</slot>`
        : html`${loading} <slot>Connecting...</slot>`}
    </a>`;
  }

  static styles = [core, component, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}
