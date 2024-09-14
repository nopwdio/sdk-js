import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../src/components/np-passkey-register.js";
import "../src/components/np-logout.js";
import "../src/components/np-status.js";
import "../src/components/np-status-history.js";
import "../src/components/np-login.js";

import { Session, get, revoke } from "../src/core/session.js";

import styles from "./demo-sdk.styles.js";

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
        <np-login></np-login>
        <np-logout></np-logout>
        <np-status></np-status>
        <np-passkey-register></np-passkey-register>
      </div>
    `;
  }
}
