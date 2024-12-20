// Import necessary modules and components from lit and internal styles
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
import styles from "./np-passkey-register.styles.js";
import {
  checkSolid,
  fingerprint,
  busy,
  exclamationCircle,
} from "../internal/styles/icons.styles.js";

import { AbortError, NoPwdError } from "../internal/api/errors.js";
import { register } from "../core/webauthn.js";
import { get } from "../core/session.js";

// Define the possible states for the component
export enum State {
  REGISTERING = "registering", // registering the passkey
  REGISTERED = "registered", // passkey has been registered
  ERROR = "error", // an error occurred
}

/** Event's detail emitted when a passkey has been created. */
export interface RegisterEvent {
  kid: string; // the access token
}

/**
 * @summary `np-passkey-register` is a custom element that facilitates the creation of a passkey for this website.
 *
 * @description
 * This component manages the registration process of a passkey, providing visual feedback during the process.
 * It handles user interactions, communicates with the WebAuthn API, and manages the component's state.
 * The component emits events to notify the parent application when the registration is successful or if an error occurs.
 *
 * @slot - The default slot for the button label.
 * @slot registering - Content displayed while the registration is in progress.
 * @slot registered - Content displayed when the passkey has been successfully created.
 * @slot error - Content displayed when an error occurs during registration.
 *
 * @event np:register - Emitted when the registration process completes successfully.
 * @event np:error - Emitted when an error occurs during the registration process.
 *
 * @csspart button - The component's button element.
 */
@customElement("np-passkey-register")
export class NpPasskeyRegister extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;
  @property({ type: Number }) resetDuration: number = 2000;

  static styles = [core, component, styles];

  private stateTimeoutId: number | null = null;
  private abort: AbortController | null = null;

  // Lifecycle method called when the component is added to the DOM
  async connectedCallback() {
    super.connectedCallback();
  }

  // Lifecycle method called when the component is removed from the DOM
  async disconnectedCallback() {
    super.disconnectedCallback();
    this.cancel();
  }

  // Handle button click event to start the registration process
  private async onClick() {
    return await this.register();
  }

  // Register a new passkey
  async register() {
    if (this.state) {
      return;
    }

    try {
      const session = await get();

      if (!session) {
        throw new Error("You must be authenticated to create a passkey");
      }

      this.abort = new AbortController();

      this.state = State.REGISTERING;
      const { id } = await register(session.token, this.abort.signal);

      this.state = State.REGISTERED;
      this.dispatchRegisterEvent(id);
      this.resetState(this.resetDuration);
    } catch (e: any) {
      if (e instanceof AbortError) {
        return this.resetState();
      }

      this.state = State.ERROR;
      this.dispatchErrorEvent(e);
      this.resetState(this.resetDuration);
    } finally {
      this.abort = null;
    }
  }

  // Cancel the registration process
  cancel() {
    if (this.abort) {
      this.abort.abort();
      this.abort = null;
    }

    this.resetState();
  }

  // Reset the component state after a specified duration
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

  // Dispatch a custom event when registration is successful
  private dispatchRegisterEvent(kid: string) {
    this.dispatchEvent(
      new CustomEvent<RegisterEvent>("np:register", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: { kid },
      })
    );
  }

  // Dispatch a custom event when an error occurs
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
    return html`<button @click=${this.onClick} part="button">
      ${!this.state
        ? html`${fingerprint}<slot>Create a passkey</slot>`
        : this.state === State.REGISTERING
        ? html`${busy}<slot name="registering">Creating...</slot>`
        : this.state === State.REGISTERED
        ? html`${checkSolid}<slot name="registered">Passkey created!</slot>`
        : html`${exclamationCircle}<slot name="error">Create a passkey</slot>`}
    </button>`;
  }
}

// Define the custom element in the global HTML namespace
declare global {
  interface HTMLElementTagNameMap {
    "np-passkey-register": NpPasskeyRegister;
  }
}
