import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
import styles from "./np-logout.styles.js";
import { busy, exclamationCircle, checkCircle } from "../internal/styles/icons.styles.js";

import { AbortError, NoPwdError } from "../internal/api/errors.js";
import { revoke } from "../core/session.js";
import { wait } from "../internal/util/wait.js";

export enum State {
  LOGGINGOUT = "loggingout", // revoking session
  LOGGEDOUT = "loggedout", // session is revoked
  ERROR = "error", // something went wrong
}

/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - The default label.
 * @slot loggingout - revoking the user session.
 * @slot loggedout - session is revoked.
 *
 * @event np:logout - Emitted when the the session has been revoked.
 * @event np:error - Emitted when an error occured.
 *
 * @csspart button - The component's button wrapper.
 */
@customElement("np-logout")
export class NpLogout extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;

  /** The reset state duration after success or error */
  @property({ type: Number }) resetDuration: number = 2000;

  async connectedCallback() {
    super.connectedCallback();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
  }

  async logout() {
    if (this.state) {
      return;
    }

    try {
      this.state = State.LOGGINGOUT;
      await revoke();
      this.state = State.LOGGEDOUT;
      await this.signalSuccess();
    } catch (e: any) {
      return this.signalError(e);
    }
  }

  private async onClick() {
    await this.logout();
  }

  private async signalSuccess() {
    this.state = State.LOGGEDOUT;

    this.dispatchEvent(
      new CustomEvent("np:logout", {
        composed: true,
        cancelable: true,
        bubbles: true,
      })
    );

    await wait(this.resetDuration);
    this.state = undefined;
  }

  private async signalError(e: unknown) {
    this.state = State.ERROR;

    this.dispatchEvent(
      new CustomEvent("np:error", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: e,
      })
    );

    await wait(this.resetDuration);
    this.state = undefined;
  }

  // Render the UI as a function of component state
  render() {
    return html`<button @click=${this.onClick} part="button">
      ${!this.state
        ? html`<slot>Logout</slot>`
        : this.state === State.LOGGINGOUT
        ? html`${busy}<slot name="loggingout">Logging out...</slot>`
        : this.state === State.LOGGEDOUT
        ? html`${checkCircle}<slot name="loggedout">Logged out!</slot>`
        : html`${exclamationCircle}<slot name="error">Logout</slot>`}
    </button>`;
  }

  static styles = [core, component, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-logout": NpLogout;
  }
}
