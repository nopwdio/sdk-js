import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import styles from "./np-status-history.styles.js";
import { wait } from "../internal/util/wait.js";
import { Status } from "../core/status.js";

@customElement("np-status-history")
export class NpStatusHistory extends LitElement {
  @property({ type: Array }) statuses: Status[] = [];
  @property({ type: Number }) limit: number = 30;

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

  connectedCallback() {
    super.connectedCallback();
    this.connect();
  }

  private async connect() {
    const base = "https://ws-a5hdgaocga-uc.a.run.app";
    const scope = this.getAttribute("scope");
    const path =
      scope === null
        ? `${base}/status?limit=${this.limit}`
        : `${base}/status/${scope}?limit=${this.limit}`;

    const ws = new WebSocket(path);

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

    ws.onclose = async () => {
      this.statuses = [];

      if (this.isConnected) {
        await wait(1000);
        requestAnimationFrame(() => this.connect());
      }
    };
  }
  static styles = [core, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-status-history": NpStatusHistory;
  }
}
