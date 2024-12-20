import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import styles from "./np-status-history.styles.js";
import { wait } from "../internal/util/wait.js";
import { Status } from "../core/status.js";
import { component } from "../internal/styles/semantic.styles.js";

/**
 * @summary `np-status-history` is a custom element that displays the status history of a service.
 *
 * @description
 * This component connects to a WebSocket server to receive real-time updates and renders the status history accordingly.
 * It maintains a list of status updates and displays them based on the success and error counts.
 * The possible status indicators are:
 * - `operational`: All systems are functioning correctly.
 * - `disrupted`: Some errors occurred.
 * - `down`: No successful responses.
 * - `nodata`: Insufficient data to determine status.
 * - `offline`: Unable to connect to the service.
 *
 * @csspart link - The component's link wrapper.
 */
@customElement("np-status-history")
export class NpStatusHistory extends LitElement {
  // Define properties
  @property({ type: Array }) statuses: Status[] = [];
  @property({ type: Number }) limit: number = 30;

  // Render the component
  render() {
    return html`${this.statuses.length === 0
      ? html``
      : this.statuses.map((status) =>
          status.success_count === 0 && status.error_count === 0
            ? html`<span class="nodata"></span>`
            : status.success_count === 0
            ? html`<span class="down"></span>`
            : status.error_count > 0
            ? html`<span class="disrupted"></span>`
            : html`<span class="operational"></span>`
        )}`;
  }

  // Lifecycle method called when the element is added to the document
  connectedCallback() {
    super.connectedCallback();
    this.connect();
  }

  // Connect to the WebSocket server
  private async connect() {
    const base = "wss://ws-a5hdgaocga-uc.a.run.app";
    const scope = this.getAttribute("scope");
    const path =
      scope === null
        ? `${base}/status?limit=${this.limit}`
        : `${base}/status/${scope}?limit=${this.limit}`;

    const ws = new WebSocket(path);

    // Handle incoming messages
    ws.onmessage = (event) => {
      const status = JSON.parse(event.data) as Status;
      if (this.statuses.length === 0) {
        this.statuses.unshift(status);
        this.requestUpdate();
        return;
      }

      if (this.statuses[0].day_id === status.day_id) {
        this.statuses[0] = status;
        this.requestUpdate();
      } else {
        this.statuses.unshift(status);
        this.requestUpdate();
      }
    };

    // Handle WebSocket closure
    ws.onclose = async () => {
      this.statuses = [];

      if (this.isConnected) {
        await wait(1000);
        this.connect();
      }
    };
  }

  // Define component styles
  static styles = [core, component, styles];
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    "np-status-history": NpStatusHistory;
  }
}
