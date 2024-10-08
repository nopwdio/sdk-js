import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "../src/components/np-login.js";
import "../src/components/np-logout.js";
import "../src/components/np-passkey-register.js";
import "../src/components/np-status.js";
import "../src/components/np-status-history.js";
import "../src/components/np-if.js";

import { Session } from "../src/core/session.js";

import styles from "./demo-sdk.styles.js";

import "./np-test.js";

declare global {
  interface HTMLElementTagNameMap {
    "demo-sdk": DemoSdk;
  }
}

@customElement("demo-sdk")
export class DemoSdk extends LitElement {
  static styles = [styles];

  connectedCallback(): void {
    super.connectedCallback();
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

  render() {
    return html`
      <div @np:login=${this.onAuthenticated} @np:logout=${this.onLogout} @np:error=${this.onError}>
        <h1>Demo</h1>
        <np-if>
          <np-login slot="unauthenticated" idletimeout="600"></np-login>
          <div slot="authenticated">
            <np-passkey-register></np-passkey-register>
            <np-logout></np-logout>
            <np-test>aze</np-test>
          </div>
          <div slot="unknown">unknown</div>
        </np-if>
        <np-status></np-status>
        <np-status-history></np-status-history>
      </div>
    `;
  }
}
