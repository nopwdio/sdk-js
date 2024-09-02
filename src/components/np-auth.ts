import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { core } from "../internal/styles/core.styles.js";
import { input } from "../internal/styles/semantic.styles.js";
import styles from "./np-auth.styles.js";
import { create, get, revoke } from "../core/session.js";
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
  UNKNOWN = "unknown",
  READY = "ready",
  AUTHENTICATING = "authenticating",
  SENT = "sent",
  AUTHENTICATED = "authenticated",
  ERROR = "error",
}

enum State2 {
  SESSION_VERIFYING = "session:verifying",
  SESSION_REVOKING = "session:revoking",
  PASSKEYS_INITIALIZING = "passkeys:initializing",
  AUTHENTICATING = "passkeys:authenticating",
  EMAIL_SENDING = "email:link:sending",
  EMAIL_SENT = "email:link:sent",
  EMAIL_RETRY = "email:link:retry",
  EMAIL_VERIFYING = "email:link:verifying",
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  ERROR = "error",
}

@customElement("np-auth")
export class NpAuth extends LitElement {
  static styles = [core, styles];

  @property({ reflect: true }) state: State = State.INITIALIZING;
  @property({ type: String }) placeholder: string = "Your email";
  @property({ type: Number }) lifetime?: number;
  @property({ type: Number }) idletimeout?: number;

  @property({ type: String }) value?: string;

  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();
    try {
      if (hasCallbackCode()) {
        this.state = State.INITIALIZING;
        const token = await handleCallbackCode();
        await create(token, this.lifetime, this.idletimeout);
        this.state = State.AUTHENTICATED;
        return;
      }

      this.startConditionalUi();
    } catch (e) {
      console.log(e);
      this.state = State.ERROR;
      await wait(3000);
      this.state = State.READY;
    }
  }

  async initialize() {}

  async loginWithEmail() {
    if (this.value === undefined || this.state !== State.READY) {
      return;
    }
    try {
      this.state = State.BUSY;
      this.abort?.abort();
      this.abort = new AbortController();
      await request({ email: this.value }, this.abort.signal);
      this.state = State.SENT;
    } catch (e) {
      console.log(e);
      this.state = State.ERROR;
      await wait(3000);
      this.state = State.READY;
    }
  }

  async startConditionalUi() {
    this.state = State.BUSY;
    const { challenge } = await getChallenge();
    this.state = State.READY;
    const auth = await signChallenge(challenge);

    this.state = State.BUSY;
    const token = await verifySignature(auth);
    const session = await create(token, this.lifetime, this.idletimeout);
    this.state = State.AUTHENTICATED;

    return session;

    for (let i = 0; i < 20; i++) {
      try {
        this.state = State.BUSY;
        const { challenge } = await getChallenge();
        this.state = State.READY;
        const auth = await signChallenge(challenge);

        this.state = State.BUSY;
        const token = await verifySignature(auth);
        await create(token, this.lifetime, this.idletimeout);
        this.state = State.AUTHENTICATED;
      } catch (e) {
        console.log(e);
        if (e instanceof NetworkError) {
          await wait(i * 1000);
        }
      }
    }
  }

  async onInput() {
    const input = this.shadowRoot?.querySelector("input");

    if (!input) {
      return;
    }

    console.log("old value:", this.value);
    this.value = input.value;
    console.log("new value:", this.value);

    if (this.state === State.SENT || this.state === State.AUTHENTICATED) {
      this.state = State.READY;
    }
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

    if (this.state === State.AUTHENTICATED) {
      return html`<button @click=${this.logout}>Logout</button>`;
    }

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
        ${this.state === State.INITIALIZING
          ? html`${loading}`
          : this.state === State.BUSY
          ? html`${loading}`
          : this.state === State.SENT
          ? html`${envelope}`
          : this.state === State.ERROR
          ? html`${warning}`
          : this.state === State.AUTHENTICATED
          ? html`${check}`
          : this.state === State.READY
          ? html`${arrowRight}`
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
