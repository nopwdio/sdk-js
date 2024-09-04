import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { core } from "../internal/styles/core.styles.js";
import { input } from "../internal/styles/semantic.styles.js";
import styles from "./np-auth.styles.js";
import { create, get, revoke, Session } from "../core/session.js";
import {
  arrowRight,
  check,
  checkSolid,
  envelope,
  loading,
  warning,
} from "../internal/styles/icons.styles.js";
import { handleCallbackCode, hasCallbackCode, request } from "../core/email.js";
import {
  getChallenge,
  isWebauthnSupported,
  signChallenge,
  startConditional,
  verifySignature,
} from "../core/webauthn.js";
import { NetworkError } from "../core/errors.js";
import { wait } from "../internal/util/wait.js";

enum Event {
  NP_UNKNOWN = "np:unknown",
  NP_LOGIN = "np:login",
  NP_LOGOUT = "np:logout",
  NP_ERROR = "np:error",
}

enum State {
  READY = "ready",
  PASSKEYS_INITIALIZING = "passkeys:initializing",
  PASSKEYS_VERIFYING = "passkeys:verifying",
  EMAIL_SENDING = "email:link:sending",
  EMAIL_SENT = "email:link:sent",
  EMAIL_RETRY = "email:link:retry",
  EMAIL_VERIFYING = "email:link:verifying",
  AUTHENTICATED = "authenticated",
  ERROR = "error",
}

@customElement("np-auth")
export class NpAuth extends LitElement {
  static styles = [core, styles];

  @property({ reflect: true }) state: State = State.READY;
  @property({ type: String }) placeholder: string = "Your email";
  @property({ type: Number }) lifetime?: number;
  @property({ type: Number }) idletimeout?: number;

  @property({ type: String }) value?: string;

  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();

    await this.handleCallbackIfNeeded();
    await this.startConditionalUI();
  }

  async handleCallbackIfNeeded() {
    if (!hasCallbackCode()) {
      this.state = State.READY;
      return false;
    }

    try {
      this.state = State.EMAIL_VERIFYING;
      const token = await handleCallbackCode();
      await create(token, this.lifetime, this.idletimeout);
      this.state = State.AUTHENTICATED;
      return true;
    } catch (e) {
      console.log(e);
      this.state = State.ERROR;
      await wait(3000);
      this.state = State.READY;
      return false;
    }
  }

  async startConditionalUI() {
    if (!(await isWebauthnSupported())) {
      return false;
    }

    for (let i = 0; i <= 20; i++) {
      try {
        this.state = State.PASSKEYS_INITIALIZING;
        const { challenge } = await getChallenge();
        this.state = State.READY;
        const auth = await signChallenge(challenge);
        this.state = State.PASSKEYS_VERIFYING;
        const token = await verifySignature(auth);
        const session = await create(token, this.lifetime, this.idletimeout);
        this.state = State.AUTHENTICATED;
        await wait(3000);
      } catch (e) {
        await wait(1000);
      }
    }

    this.state = State.READY;
    return false;
  }

  async signalSuccess(session: Session) {}

  async signalError() {}

  async loginWithEmail() {
    if (this.value === undefined || this.state !== State.READY) {
      return;
    }
    try {
      this.state = State.EMAIL_SENDING;
      this.abort?.abort();
      this.abort = new AbortController();
      await request({ email: this.value }, this.abort.signal);
      this.state = State.EMAIL_SENT;
    } catch (e) {
      console.log(e);
      this.state = State.ERROR;
      await wait(3000);
      this.state = State.READY;
    }
  }

  async onInput() {
    const input = this.shadowRoot?.querySelector("input");

    if (!input) {
      return;
    }

    // TODO : if old.length === 0 && new.length >= 3 --> autocomplete probable --> submit
    console.log("old value:", this.value);
    this.value = input.value;
    console.log("new value:", this.value);
  }

  onKeyUp(e: KeyboardEvent) {
    if (e.key === "Enter") {
      this.loginWithEmail();
    }
  }

  async logout() {
    await revoke();
  }

  render() {
    console.log(this.state);

    return html`
      <input
        type="email"
        @input=${this.onInput}
        placeholder=${this.placeholder}
        id="${this.id}"
        autocomplete="username webauthn"
        part="input"
      />
      <button @click=${this.loginWithEmail}>
        ${this.state === State.EMAIL_SENDING
          ? html`${loading}`
          : this.state === State.EMAIL_SENT
          ? html`${envelope}`
          : this.state === State.EMAIL_VERIFYING
          ? html`${loading}`
          : this.state === State.PASSKEYS_INITIALIZING
          ? html`${arrowRight}`
          : this.state === State.PASSKEYS_VERIFYING
          ? html`${loading}`
          : this.state === State.AUTHENTICATED
          ? html`${check}`
          : this.state === State.READY
          ? html`${arrowRight}`
          : this.state === State.ERROR
          ? html`${warning}`
          : html``}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-auth": NpAuth;
  }
}
