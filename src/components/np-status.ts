import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { link } from "../internal/styles/semantic.styles.js";
import styles from "./np-status.styles.js";
import { loading, warning, circleSolid, wifiOff } from "../internal/styles/icons.styles.js";

import { get } from "../core/status.js";
import { minWait, wait } from "../internal/util/wait.js";
import { NetworkError } from "../core/errors.js";

export enum State {
  OPERATIONAL = "operational",
  DISRUPTED = "disrupted",
  DOWN = "down",
  UNKNOWN = "unknown",
  OFFLINE = "offline",
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
  @property({ reflect: true }) state: State = State.UNKNOWN;

  constructor() {
    super();
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  async connectedCallback() {
    super.connectedCallback();

    window.addEventListener("online", this.start);
    window.addEventListener("offline", this.stop);

    this.start();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener("online", this.start);
    window.removeEventListener("offline", this.stop);

    this.stop();
  }

  private async updateStatus() {
    try {
      if (this.state === State.OFFLINE) {
        return;
      }

      const statuses = await get({});
      const status = statuses[0];

      if (status.success_count === 0) {
        this.state = State.DOWN;
        return;
      }

      if (status.error_count > 0) {
        this.state = State.DISRUPTED;
        return;
      }

      this.state = State.OPERATIONAL;
    } catch (e) {
      this.state = State.UNKNOWN;
    } finally {
      await wait(3000);
      requestAnimationFrame(() => this.updateStatus());
    }
  }

  private async start() {
    this.state = State.UNKNOWN;
    this.updateStatus();
  }

  private async stop() {
    this.state = State.OFFLINE;
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
        : this.state === State.OFFLINE
        ? html`${wifiOff} offline`
        : html`${loading}<slot>fetching status...</slot>`}
    </a>`;
  }

  static styles = [core, link, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}
