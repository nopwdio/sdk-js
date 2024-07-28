import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { core } from "../internal/styles/core.styles.js";
import { input } from "../internal/styles/semantic.styles.js";
import styles from "./np-auth.styles.js";
import { get, revoke } from "../core/session.js";
import { loading } from "../internal/styles/icons.styles.js";

enum State {
  SESSION_VERIFYING = "session:verifying",
  SESSION_NONE = "session:none",
  SESSION_VALID = "session:valid",
  SESSION_CREATING = "session:creating",
  SESSION_CREATING_SUCCESS = "session:creating:success",
  SESSION_CREATING_ERROR = "session:creating:error",

  EMAIL_LINK_SENDING = "email:link:sending",
  EMAIL_LINK_SENDING_ERROR = "email:link:sending:error",
  EMAIL_LINK_SENT = "email:link:sending:success",
  EMAIL_LINK_VERIFYING_ERROR = "email:link:verifying:error",
  EMAIL_LINK_VERIFYING_SUCCESS = "email:link:verifying:success",

  PASSKEYS_SUGGESTING = "passkeys:suggesting",
  PASSKEYS_REGISTERING = "passkeys:registering",
  PASSKEYS_REGISTERING_ERROR = "passkeys:registering:error",
  PASSKEYS_REGISTERING_SUCCESS = "passkeys:registering:success",
}

@customElement("np-auth")
export class NpAuth extends LitElement {
  static styles = [core, input, styles];
  @property({ reflect: true }) state: State = State.SESSION_VERIFYING;

  async connectedCallback() {
    super.connectedCallback();

    this.state = State.SESSION_VERIFYING;

    const session = await get();

    if (session === null) {
      this.state = State.SESSION_NONE;
    } else {
      this.state = State.SESSION_VALID;
    }
  }

  async logout() {
    await revoke();
    this.state = State.SESSION_NONE;
  }

  render() {
    console.log(this.state);
    if (this.state === State.SESSION_VERIFYING) {
      return html`${loading}`;
    }

    if (this.state === State.SESSION_VALID) {
      return html`authenticated`;
    }

    if (this.state === State.SESSION_NONE) {
      return html`<input />`;
    }

    return html`unknown state`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-auth": NpAuth;
  }
}
