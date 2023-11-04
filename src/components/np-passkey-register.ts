import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { button } from "../internal/styles/semantic.styles.js";
import styles from "./np-passkey-register.styles.js";
import { loading, warning, checkSolid, fingerprint } from "../internal/styles/icons.styles.js";

import { AbortError, NetworkError, NoPwdError, UnauthorizedError } from "../internal/api/errors.js";
import { register } from "../core/webauthn.js";
import { getPayload } from "../core/token.js";

export type State =
  | "registering" // registering the passkey
  | "registered" // passkey has been registered
  | "error"; // an error occured

/** Event's detail emitted when a passkey has been created.. */
export type RegisterEvent = {
  kid: string; // the access token
};

/**
 * @summary Creates a Passkey associated with the authenticated user.
 *
 * @slot - The default label.
 * @slot registering - the registration of the passkey is in progress.
 * @slot registered - the passkey has been created.
 *
 * @event np:register - Emitted when the registration flow has been completed.
 *
 * @csspart button - The component's button wrapper.
 */
@customElement("np-passkey-register")
export class NpPasskeyRegister extends LitElement {
  /** The component's state. */
  @property({ reflect: true }) state?: State = undefined;

  /** The user's access token. */
  @property() token?: string = undefined;

  @property({ type: Number }) resetDuration: number = 2000;

  static styles = [core, button, styles];

  private stateTimeoutId: number | null = null;
  private abort: AbortController | null = null;

  async connectedCallback() {
    super.connectedCallback();
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    this.cancel();
  }

  private onClick() {
    this.register();
  }

  async register() {
    if (this.state) {
      return;
    }

    try {
      if (!this.token) {
        console.warn("missing 'token' attribute");
        return;
      }

      const payload = getPayload(this.token);

      // if the token expires in less than 30s, we reject it
      if (payload.exp - 30 <= Date.now() / 1000) {
        throw new UnauthorizedError({ error: "token has expired" });
      }

      this.abort = new AbortController();
      this.state = "registering";
      const { id } = await register(this.token, this.abort.signal);

      this.state = "registered";
      this.resetState(this.resetDuration);
      this.dispatchRegisterEvent(id);
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
    return html` <button @click=${this.onClick} part="button">
      ${!this.state
        ? html`${fingerprint}<slot>Create a passkey</slot>`
        : this.state === "registering"
        ? html`${loading} <slot name="creating">Creating...</slot>`
        : this.state === "registered"
        ? html`${checkSolid} <slot name="created">passkey created!</slot>`
        : html`${warning} <slot name="error">Create a passkey</slot>`}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-passkey-register": NpPasskeyRegister;
  }
}
