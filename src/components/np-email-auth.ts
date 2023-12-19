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
import { Session, create } from "../core/session.js";

export type AuthEvent = {
  access_token: string;
  access_token_payload: TokenPayload;
  suggest_passkeys: boolean;
};

export type State =
  | "busy" // please wait
  | "requested" // the authentication request has been sent
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
  @property({ type: Number }) resetDuration: number = 2000;

  static styles = [core, button, styles];
  static formAssociated = true;
  private internals = this.attachInternals();

  get form() {
    return this.internals.form;
  }

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

      this.state = "busy";
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

      this.state = "busy";
      const token = await handleCallbackCode(this.abort.signal);

      // we create the session
      const session = await create(token, 24 * 3600);

      this.state = "authenticated";
      this.resetState(this.resetDuration);

      this.dispatchSessionEvent(session);
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

  private async dispatchSessionEvent(session: Session) {
    this.dispatchEvent(
      new CustomEvent<Session>("np:session", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: session,
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
        : this.state === "busy"
        ? html` <slot name="busy">${loading}</slot>`
        : this.state === "requested"
        ? html`<slot name="requested">${envelope} Check your mailbox</slot>`
        : this.state === "authenticated"
        ? html`<slot name="authenticated">${checkSolid} Authenticated</slot>`
        : html`<slot name="error">${warning} Something went wrong</slot>`}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-email-auth": NpEmailLogin;
  }
}
