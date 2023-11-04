import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../src/components/np-passkey-conditional.js";
import "../src/components/np-passkey-register.js";
import "../src/components/np-email-auth.js";

import styles from "./demo-sdk.styles.js";
import { NpPasskeyConditional, AuthEvent } from "../src/components/np-passkey-conditional.js";

declare global {
  interface HTMLElementTagNameMap {
    "demo-sdk": DemoSdk;
  }
}

@customElement("demo-sdk")
export class DemoSdk extends LitElement {
  @property() private email: string = "";
  @property() private token: string = "aze";
  @property({ type: Object }) private auth?: AuthEvent;

  static styles = [styles];

  private onInput(e: InputEvent) {
    const input = e.currentTarget as NpPasskeyConditional;
    this.email = input.value;
  }

  private onAuthenticated(e: CustomEvent<AuthEvent>) {
    this.auth = e.detail;
  }

  render() {
    return html`
      <div @np:auth=${this.onAuthenticated}>
        <h1>Demo</h1>
        <np-passkey-conditional @input=${this.onInput}></np-passkey-conditional>
        <np-email-auth email=${this.email}></np-email-auth>
        <np-passkey-register token=${this.token}></np-passkey-register>
      </div>
    `;
  }
}
