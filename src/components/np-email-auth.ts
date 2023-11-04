import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { button } from "../internal/styles/semantic.styles.js";
import styles from "./np-email-auth.styles.js";
import { envelope, loading, warning, checkSolid } from "../internal/styles/icons.styles.js";
import { handleCallbackCode, hasCallbackCode, request } from "../core/email.js";
import { AbortError, NetworkError } from "../core/errors.js";

import { TokenPayload, getPayload } from "../core/token.js";
import { isWebauthnSupported } from "../core/webauthn.js";

export type AuthEvent = {
  access_token: string;
  access_token_payload: TokenPayload;
  suggest_passkeys: boolean;
};

export type State =
  | "requesting" // sending an authentication request
  | "requested" // the authentication request has been sent
  | "verifying" // verifying the authorization link
  | "authenticated" // the user has been authenticated
  | "error"; // An error occured

/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - the default label.
 * @slot requesting - sending an authentication request
 * @slot requested - the authentication request has been sent
 * @slot verifying - verifying the authorization link
 * @slot authenticated - the user has been authenticated
 * @slot error - Something bad occured.
 *
 * @event np:auth - Emitted when the authentication flow has been completed.
 * @event np:error - Emitted when an error occured.
 *
 * @csspart button - The component's button wrapper.
 */
@customElement("np-email-auth")
export class NpEmailLogin extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;
  /** The user's email to authenticate. */
  @property() email?: string = undefined;
  @property() resetDuration: number = 2000;

  static styles = [core, button, styles];

  private stateTimeoutId: number | null = null;
  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();
    this.handleCallbackCodeIfNeeded();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.cancel();
  }

  private onClick() {
    this.login();
  }

  async login() {
    if (this.state) {
      return;
    }

    try {
      this.abort = new AbortController();

      this.state = "requesting";
      const expiresAt = await request({ email: this.email || "" }, this.abort.signal);

      this.state = "requested";
      this.resetState(expiresAt * 1000 - Date.now());
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

  private async handleCallbackCodeIfNeeded() {
    if (!hasCallbackCode()) {
      return;
    }
    try {
      this.abort = new AbortController();

      this.state = "verifying";
      const token = await handleCallbackCode(this.abort.signal);

      this.state = "authenticated";
      this.dispatchAuthEvent(token, getPayload(token), await isWebauthnSupported());
      this.resetState(this.resetDuration);
    } catch (e: any) {
      if (e instanceof AbortError) {
        return this.resetState();
      }

      this.state = "error";
      this.resetState(this.resetDuration);
      return this.dispatchErrorEvent(e);
    } finally {
      this.abort = null;
    }
  }

  private cancel() {
    if (this.abort) {
      this.abort.abort();
      this.abort = null;
    }

    this.resetState();
  }

  private resetState(ms?: number) {
    if (this.stateTimeoutId) {
      window.clearTimeout(this.stateTimeoutId);
      this.stateTimeoutId = null;
    }

    if (ms === undefined) {
      this.state = undefined;
      return;
    }

    this.stateTimeoutId = window.setTimeout(() => (this.state = undefined), ms);
  }

  private dispatchAuthEvent(
    access_token: string,
    access_token_payload: TokenPayload,
    suggest_passkeys: boolean
  ) {
    const authEvent: AuthEvent = {
      access_token,
      access_token_payload,
      suggest_passkeys,
    };

    this.dispatchEvent(
      new CustomEvent("np:auth", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: authEvent,
      })
    );
  }

  private dispatchErrorEvent(e: any) {
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
        ? html`<slot>Passwordless Login</slot>`
        : this.state === "requesting"
        ? html`${loading} <slot name="requesting">Sending request...</slot>`
        : this.state === "requested"
        ? html`${envelope} <slot name="requested">Check your mailbox</slot>`
        : this.state === "verifying"
        ? html`${loading} <slot name="verifying">Authorizing...</slot>`
        : this.state === "authenticated"
        ? html`${checkSolid} <slot name="authenticated">Authenticated</slot>`
        : html`${warning} <slot name="error">Passwordless Login</slot>`}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-email-auth": NpEmailLogin;
  }
}
