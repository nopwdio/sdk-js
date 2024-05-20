import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../src/components/np-passkey-conditional.js";
import "../src/components/np-passkey-register.js";
import "../src/components/np-email-auth.js";
import "../src/components/np-logout.js";
import "../src/components/np-status.js";
import "../src/components/np-status-history.js";

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
    const c = e.target as NpPasskeyConditional;
    console.log(await c.getSession());
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

  private async stream() {
    const base = "wss://ws-a5hdgaocga-uc.a.run.app";
    const path = `${base}/countries`;
    const ws = new WebSocket(path);

    ws.onmessage = (event) => {
      console.log(JSON.parse(event.data));
    };
  }

  render() {
    return html`
      <div @np:login=${this.onAuthenticated} @np:logout=${this.onLogout} @np:error=${this.onError}>
        <h1>Demo</h1>
        <np-status></np-status>
        <np-status-history></np-status-history>
        <button @click=${() => this.stream()}>stream</button>
        <button @click=${() => this.refresh()}>refresh</button>
        <np-logout></np-logout>
        <np-passkey-conditional
          id="aze"
          @input=${this.onInput}
          sessionlifetime="3600"
        ></np-passkey-conditional>
        <np-email-auth email=${this.email} name="aze" id="aze"></np-email-auth>
        <np-passkey-register token=${this.token}></np-passkey-register>
        <np-test open></np-test>
      </div>
    `;
  }
}

@customElement("np-test")
export class NpTest extends LitElement {
  toggle() {
    this.hasAttribute("open") ? this.removeAttribute("open") : this.setAttribute("open", "");
  }

  render() {
    return html`<button @click=${this.toggle}>toggle</button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "np-test": NpTest;
  }
}
