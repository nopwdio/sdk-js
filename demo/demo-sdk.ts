import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../src/components/np-passkey-conditional.js";
import "../src/components/np-passkey-register.js";
import "../src/components/np-email-auth.js";
import "../src/components/np-logout.js";
import "../src/components/np-status.js";

import { Session, get, revoke } from "../src/core/session.js";

import styles from "./demo-sdk.styles.js";
import { NpPasskeyConditional } from "../src/components/np-passkey-conditional.js";

declare global {
  interface HTMLElementTagNameMap {
    "demo-sdk": DemoSdk;
  }
}

@customElement("demo-sdk")
export class DemoSdk extends LitElement {
  @property() private email: string = "";
  @property() private token: string = "aze";
  @property({ type: Object }) private auth?: Session;

  static styles = [styles];

  private onInput(e: InputEvent) {
    const input = e.currentTarget as NpPasskeyConditional;
    this.email = input.value;
  }

  private async onAuthenticated(e: CustomEvent<Session>) {
    console.log(e.detail);
  }

  private async onError(e: CustomEvent<Error>) {
    console.log(e.detail);
  }

  private async onLogout(e: CustomEvent) {
    console.log("logout");
  }

  private async refresh() {
    console.log(await get());
  }

  private async revoke() {
    console.log(await revoke());
  }

  render() {
    return html`
      <div @np:login=${this.onAuthenticated} @np:logout=${this.onLogout} @np:error=${this.onError}>
        <h1>Demo</h1>
        <np-status></np-status>
        <button @click=${() => this.refresh()}>refresh</button>
        <np-logout></np-logout>
        <np-passkey-conditional
          @input=${this.onInput}
          sessionlifetime="3600"
        ></np-passkey-conditional>
        <np-email-auth email=${this.email} name="aze" id="aze"></np-email-auth>
        <np-passkey-register token=${this.token}></np-passkey-register>
      </div>
    `;
  }
}
