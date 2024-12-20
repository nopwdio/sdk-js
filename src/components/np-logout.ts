import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
import styles from "./np-logout.styles.js";
import { busy, exclamationCircle, checkCircle } from "../internal/styles/icons.styles.js";

import { revoke } from "../core/session.js";
import { wait } from "../internal/util/wait.js";

// Define the possible states for the component
export enum State {
  LOGGINGOUT = "loggingout", // Revoking session
  LOGGEDOUT = "loggedout", // Session is revoked
  ERROR = "error", // An error occurred
}

/**
 * @summary `np-logout` is a custom element that handles logging out the authenticated user.
 *
 * @description This component manages the logout process, providing visual feedback during the process.
 * It emits events to notify the parent application when the logout is successful or if an error occurs.
 *
 * @slot - The default slot for the button label.
 * @slot loggingout - Content displayed while the user session is being revoked.
 * @slot loggedout - Content displayed after the session has been successfully revoked.
 * @slot error - Content displayed when an error occurs during logout.
 *
 * @event np:logout - Emitted when the session has been successfully revoked.
 * @event np:error - Emitted when an error occurs during the logout process.
 *
 * @csspart button - The component's button element.
 */
@customElement("np-logout")
export class NpLogout extends LitElement {
  /** The component's current state. */
  @property({ reflect: true }) state?: State = undefined;

  /** Duration to reset the state after success or error (in milliseconds). */
  @property({ type: Number }) resetDuration: number = 2000;

  // Lifecycle method called when the component is added to the DOM
  async connectedCallback() {
    super.connectedCallback();
  }

  // Lifecycle method called when the component is removed from the DOM
  async disconnectedCallback() {
    super.disconnectedCallback();
  }

  // Method to handle the logout process
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

  // Method to handle the click event
  private async onClick() {
    await this.logout();
  }

  // Method to signal a successful logout
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

  // Method to signal an error during logout
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

  // Render the UI based on the component's state
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

  // Define the styles for the component
  static styles = [core, component, styles];
}

// Register the custom element with the browser
declare global {
  interface HTMLElementTagNameMap {
    "np-logout": NpLogout;
  }
}
