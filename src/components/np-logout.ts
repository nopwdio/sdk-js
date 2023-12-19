import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { button } from "../internal/styles/semantic.styles.js";
import styles from "./np-logout.styles.js";
import { loading, warning, checkSolid } from "../internal/styles/icons.styles.js";

import { AbortError, NoPwdError } from "../internal/api/errors.js";
import { get, revoke } from "../core/session.js";

export type State = "busy" | "loggedout" | "error";

/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - The default label.
 * @slot registering - the registration of the passkey is in progress.
 * @slot registered - the passkey has been created.
 *
 * @event np:register - Emitted when the registration flow has been completed.
 *
 * @csspart button - The component's button wrapper.
 */
@customElement("np-logout")
export class NpLogout extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;

  /** The user's access token. */
  @property() token?: string = undefined;

  @property({ type: Number }) resetDuration: number = 2000;

  static styles = [core, button, styles];

  private stateTimeoutId: number | null = null;
  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.cancel();
  }

  private async onClick() {
    await this.logout();
  }

  async logout() {
    if (this.state) {
      return;
    }

    try {
      this.state = "busy";
      await revoke();
      this.state = "loggedout";
      this.resetState(this.resetDuration);
      this.dispatchLogoutEvent();
    } catch (e: any) {
      if (e instanceof AbortError) {
        return this.resetState();
      }

      this.state = "error";
      this.resetState(this.resetDuration);
      this.dispatchErrorEvent(e);
    } finally {
      this.abort = null;
    }
  }

  cancel() {
    if (this.abort) {
      this.abort.abort();
      this.abort = null;
    }

    this.resetState();
  }

  private resetState(ms: number = 0) {
    return new Promise((resolve) => {
      if (this.stateTimeoutId) {
        window.clearTimeout(this.stateTimeoutId);
        this.stateTimeoutId = null;
      }

      this.stateTimeoutId = window.setTimeout(() => {
        this.state = undefined;
      }, ms);
    });
  }

  private dispatchLogoutEvent() {
    this.dispatchEvent(
      new CustomEvent("np:logout", {
        composed: true,
        cancelable: true,
        bubbles: true,
      })
    );
  }

  private dispatchErrorEvent(e: NoPwdError) {
    this.dispatchEvent(
      new CustomEvent("np:error", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: e,
      })
    );
  }

  // Render the UI as a function of component state
  render() {
    return html` <button @click=${this.onClick} part="button">
      ${!this.state
        ? html`<slot>Logout</slot>`
        : this.state === "busy"
        ? html`<slot name="busy">${loading}</slot>`
        : this.state === "loggedout"
        ? html`<slot name="loggedout">${checkSolid} Bye!</slot>`
        : html`<slot name="error">${warning} Something went wrong</slot>`}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-logout": NpLogout;
  }
}
