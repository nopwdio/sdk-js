import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { core } from "../internal/styles/core.styles.js";
import { input } from "../internal/styles/semantic.styles.js";
import styles from "./np-auth.styles.js";

enum State {
  UNAUTHENTICATED,
  SENDING_EMAIL_LINK,
  EMAIL_LINK_SENT,
  SENDING_EMAIL_OTP,
  EMAIL_OTP_SENT,
  AUTHENTICATED,
}

@customElement("np-auth")
export class NpAuth extends LitElement {
  static styles = [core, input, styles];

  render() {
    return html`np-auth`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-auth": NpAuth;
  }
}
