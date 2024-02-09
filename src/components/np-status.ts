import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { link } from "../internal/styles/semantic.styles.js";
import styles from "./np-status.styles.js";
import { loading, warning, circleSolid } from "../internal/styles/icons.styles.js";

import { get } from "../core/status.js";
import { wait } from "../internal/util/wait.js";

export enum State {
  OPERATIONAL = "operational",
  DISRUPTED = "disrupted",
  DOWN = "down",
  UNKNOWN = "unknown",
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
  @property({ reflect: true, type: Boolean }) refreshing: boolean = false;
  @property({ reflect: true }) state: State = State.UNKNOWN;
  private intervalId?: number;

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
      wait(100);

      if (this.refreshing) {
        return;
      }

      this.refreshing = true;
      const status = await get(1);
      //      await wait(100);

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
      this.refreshing = false;
    }
  }

  private async start() {
    this.stop();
    this.updateStatus();
    this.intervalId = window.setInterval(this.updateStatus, 60000);
  }

  private stop() {
    clearInterval(this.intervalId);
    this.state = State.UNKNOWN;
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
        : html`${this.refreshing ? loading : html``}<slot>API status</slot>`}
    </a>`;
  }

  static styles = [core, link, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status": NpStatus;
  }
}
