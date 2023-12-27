import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { button } from "../internal/styles/semantic.styles.js";
import styles from "./np-email-auth.styles.js";
import { envelope, loading, warning, checkSolid } from "../internal/styles/icons.styles.js";
import { handleCallbackCode, hasCallbackCode, request } from "../core/email.js";
import { AbortError, NetworkError } from "../core/errors.js";

import { Session, create, get } from "../core/session.js";

export enum State {
  REQUESTING = "requesting", // sending an authentication request
  REQUESTED = "requested", // the authentication request has been sent
  VERIFYING = "verifying", // verifying the authorization code
  LOGGEDIN = "loggedin", // session created
  ERROR = "error", // something went wrong
}
/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - the default label.
 * @slot requesting - sending an authentication request
 * @slot requested - the authentication request has been sent
 * @slot verifying - verifying the authorization code
 * @slot loggingin - creating the session
 * @slot loggedin - session created
 * @slot error - something went wrong.
 *
 * @event np:login - Emitted when the session has been created.
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

  @property({ type: Number }) lifetime?: number;
  @property({ type: Number }) idletimeout?: number;

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

    const session = await get();

    if (session) {
      this.dispatchLoginEvent(session);
      return;
    }

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
    if (this.state && this.email === undefined) {
      return;
    }

    try {
      this.abort = new AbortController();

      this.state = State.REQUESTING;
      const expiresAt = await request({ email: this.email || "" }, this.abort.signal);

      this.state = State.REQUESTED;
      this.resetState(expiresAt * 1000 - Date.now());
    } catch (e: any) {
      if (e instanceof AbortError) {
        return this.resetState();
      }

      this.state = State.ERROR;
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

      this.state = State.VERIFYING;
      const token = await handleCallbackCode(this.abort.signal);
      const session = await create(token, this.lifetime, this.idletimeout);

      this.state = State.LOGGEDIN;
      this.resetState(this.resetDuration);

      this.dispatchLoginEvent(session);
    } catch (e: any) {
      if (e instanceof AbortError) {
        return this.resetState();
      }

      this.state = State.ERROR;
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

  private async dispatchLoginEvent(session: Session) {
    this.dispatchEvent(
      new CustomEvent<Session>("np:login", {
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
        : this.state === State.REQUESTING
        ? html`${loading} <slot name="requesting">Requesting...</slot>`
        : this.state === State.REQUESTED
        ? html`${envelope} <slot name="requested">Check your mailbox</slot>`
        : this.state === State.VERIFYING
        ? html`${loading} <slot name="verifying">Please wait...</slot>`
        : this.state === State.LOGGEDIN
        ? html`${checkSolid} <slot name="loggedin">Logged in</slot>`
        : html`${warning} <slot name="error">Something went wrong</slot>`}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-email-auth": NpEmailLogin;
  }
}
