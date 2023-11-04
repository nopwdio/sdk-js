import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { input } from "../internal/styles/semantic.styles.js";
import styles from "./np-passkey-conditional.styles.js";

import { AbortError } from "../core/errors.js";
import {
  getChallenge,
  isWebauthnSupported,
  signChallenge,
  verifySignature,
} from "../core/webauthn.js";
import { TokenPayload, getPayload } from "../core/token.js";

export type AuthEvent = {
  access_token: string;
  access_token_payload: TokenPayload;
};

export type State =
  | "initializing" // getting challenge
  | "authenticating" // waiting user to authenticate
  | "verifying" // verifying the challenge signature
  | "authenticated" // the user is authenticated
  | "error"; // an error occured

/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - The default label.
 * @slot initializing - getting challenge from the server.
 * @slot authenticating - User authentication process.
 * @slot verifying - Signature verification.
 * @slot authenticated - Authentication process has been completed.
 *
 * @event np:auth - Emitted when the authentication flow has been completed.
 *
 * @csspart input - The component's input wrapper.
 */
@customElement("np-passkey-conditional")
export class NpPasskeyConditional extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;
  /** The input's placeholder. */
  @property() placeholder: string = "enter your email";
  /** The input's enterkeyhint. */
  @property() enterkeyhint: string = "Send";
  /** The input's value. */
  @property() value: string = "";

  @property({ type: Number }) resetDuration: number = 2000;

  static styles = [core, input, styles];

  private stateTimeoutId: number | null = null;
  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();
    this.startConditional();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.cancel();
  }

  private async startConditional() {
    if (this.state) {
      return;
    }

    if (!(await isWebauthnSupported())) {
      return;
    }

    try {
      this.abort = new AbortController();

      this.state = "initializing";
      const { challenge } = await getChallenge(this.abort.signal);

      this.state = "authenticating";
      const authResponse = await signChallenge(challenge, this.abort.signal);

      this.state = "verifying";
      const token = await verifySignature(authResponse, this.abort.signal);

      this.state = "authenticated";
      await this.dispatchAuthEvent(token, getPayload(token));
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

  private async dispatchAuthEvent(access_token: string, access_token_payload: TokenPayload) {
    await this.updateComplete; // to ensure consistencies

    this.dispatchEvent(
      new CustomEvent<AuthEvent>("np:auth", {
        composed: true,
        cancelable: true,
        bubbles: true,
        detail: {
          access_token,
          access_token_payload,
        },
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

  private onInput(e: KeyboardEvent) {
    const input = this.shadowRoot?.querySelector("input");

    if (!input) {
      return;
    }

    this.value = input.value;
  }

  // Render the UI as a function of component state
  render() {
    return html`
      <input
        type="email"
        @input=${this.onInput}
        @focus=${this.startConditional}
        .value=${this.value}
        placeholder=${this.placeholder}
        autocomplete="email username webauthn"
        enterkeyhint=${this.enterkeyhint}
        part="input"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-passkey-conditional": NpPasskeyConditional;
  }
}
