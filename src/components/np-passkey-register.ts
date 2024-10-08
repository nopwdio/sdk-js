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

import { AbortError, NetworkError, NoPwdError, UnauthorizedError } from "../internal/api/errors.js";
import { register } from "../core/webauthn.js";
import { get } from "../core/session.js";

export enum State {
  REGISTERING = "registering", // registering the passkey
  REGISTERED = "registered", // passkey has been registered
  ERROR = "error", // an error occured
}

/** Event's detail emitted when a passkey has been created.. */
export interface RegisterEvent {
  kid: string; // the access token
}

/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - The default label.
 * @slot registering - the registration of the passkey is in progress.
 * @slot registered - the passkey has been created.
 *
 * @event np:register - Emitted when the registration flow has been completed.
 * @event np:error - Emitted when an error occured.
 *
 * @csspart button - The component's button wrapper.
 */
@customElement("np-passkey-register")
export class NpPasskeyRegister extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;

  @property({ type: Number }) resetDuration: number = 2000;

  static styles = [core, component, styles];

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
    return await this.register();
  }

  async register() {
    if (this.state) {
      return;
    }

    try {
      const session = await get();

      if (!session) {
        throw new Error("you must be authenticated to create a passkey");
        return;
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

declare global {
  interface HTMLElementTagNameMap {
    "np-passkey-register": NpPasskeyRegister;
  }
}
