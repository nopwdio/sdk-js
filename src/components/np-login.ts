import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
import styles from "./np-login.styles.js";
import {
  arrowRightCircle,
  busy,
  checkCircle,
  envelope,
  exclamationCircle,
} from "../internal/styles/icons.styles.js";

import { handleCallbackCode, hasCallbackCode, request } from "../core/email.js";
import {
  getChallenge,
  isWebauthnSupported,
  signChallenge,
  verifySignature,
} from "../core/webauthn.js";

import { create, Session } from "../core/session.js";

import { wait } from "../internal/util/wait.js";

enum State {
  READY = "ready",
  EMAIL_SENDING = "email:link:sending",
  EMAIL_SENT = "email:link:sent",
  EMAIL_VERIFYING = "email:link:verifying",
  AUTHENTICATED = "authenticated",
  PASSKEYS_VERIFYING = "passkeys:verifying",
  ERROR = "error",
}

/**
 * @summary Component allowing user authentication via a link sent by email
 * (magic-link) or Passkeys if an access key has been previously created
 * for this website (i.e. with the <np-passkey-register> component).
 *
 * @event np:login - Emitted when the session has been created.
 * @event np:error - Emitted when an error occured.
 *
 * @csspart button - The component's submit-button wrapper.
 * @csspart input - The component's email-input wrapper.
 * */
@customElement("np-login")
export class NpLogin extends LitElement {
  static styles = [core, component, styles];

  @property({ reflect: true }) state: State = State.READY;
  @property({ type: String }) placeholder: string = "Your email";
  @property({ type: String }) id: string = "input";
  @property({ type: Number }) lifetime?: number;
  @property({ type: Number }) idletimeout?: number;

  @property({ type: String }) value: string = "";

  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();

    this.startConditionalUI();
    this.handleCallbackIfNeeded();
  }

  async loginWithEmail() {
    if ((this.state !== State.READY && this.state !== State.EMAIL_SENT) || this.value.length < 3) {
      return;
    }

    try {
      this.state = State.EMAIL_SENDING;
      const resp = await request({ email: this.value });
      this.state = State.EMAIL_SENT;
      return resp;
    } catch (e) {
      this.signalError(e);
    }
  }

  private async handleCallbackIfNeeded() {
    if (!hasCallbackCode()) {
      this.state = State.READY;
      return false;
    }

    try {
      this.state = State.EMAIL_VERIFYING;
      const token = await handleCallbackCode();
      const session = await create(token, this.lifetime, this.idletimeout);
      await this.signalSuccess(session);
    } catch (e) {
      await this.signalError(e);
    }
  }

  private async startConditionalUI() {
    if (!(await isWebauthnSupported())) {
      return false;
    }

    for (let i = 0; i <= 20; i++) {
      try {
        const { challenge } = await getChallenge();
        const auth = await signChallenge(challenge);
        this.state = State.PASSKEYS_VERIFYING;
        const token = await verifySignature(auth);
        const session = await create(token, this.lifetime, this.idletimeout);
        await this.signalSuccess(session);
      } catch (e) {
        await this.signalError(e);
      }
    }

    this.state = State.READY;
    return false;
  }

  private async signalSuccess(session: Session) {
    this.state = State.AUTHENTICATED;

    this.dispatchEvent(
      new CustomEvent("np:login", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: session,
      })
    );

    await wait(3000);
    this.state = State.READY;
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

    await wait(1000);
    this.state = State.READY;
  }

  private async onInput() {
    const input = this.shadowRoot?.querySelector("input");

    if (!input) {
      return;
    }

    const oldValue = this.value;
    this.value = input.value;

    // capturing copy/past or password manager
    if (oldValue.length === 0 && this.value.length >= 3) {
      this.loginWithEmail();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key === "Enter") {
      this.loginWithEmail();
    }
  }

  render() {
    return html`
      <input
        type="email"
        @input=${this.onInput}
        @keyup=${this.onKeyUp}
        placeholder=${this.placeholder}
        id="${this.id}"
        autocomplete="username webauthn"
        part="input"
      />
      <button @click=${this.loginWithEmail} part="button">
        ${this.state === State.EMAIL_SENDING
          ? html`${busy}`
          : this.state === State.EMAIL_SENT
          ? html`${envelope}`
          : this.state === State.EMAIL_VERIFYING
          ? html`${busy}`
          : this.state === State.PASSKEYS_VERIFYING
          ? html`${busy}`
          : this.state === State.AUTHENTICATED
          ? html`${checkCircle}`
          : this.state === State.READY
          ? html`${arrowRightCircle}`
          : this.state === State.ERROR
          ? html`${exclamationCircle}`
          : html``}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-login": NpLogin;
  }
}
