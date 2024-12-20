// Import necessary modules and components from lit and local files
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "../src/components/np-login.js";
import "../src/components/np-logout.js";
import "../src/components/np-passkey-register.js";
import "../src/components/np-status.js";
import "../src/components/np-status-history.js";
import "../src/components/np-if.js";

import { Session } from "../src/core/session.js";

import styles from "./demo-sdk.styles.js";

// Define a custom element 'demo-sdk' using the LitElement base class
@customElement("demo-sdk")
export class DemoSdk extends LitElement {
  // Apply styles to the component
  static styles = [styles];

  // Lifecycle method called when the element is added to the document
  connectedCallback(): void {
    super.connectedCallback();
  }

  // Event handler for authentication success
  private async onAuthenticated(e: CustomEvent<Session>) {
    console.log(e.detail);
  }

  // Event handler for errors
  private async onError(e: CustomEvent<Error>) {
    console.log(e.detail);
  }

  // Event handler for logout
  private async onLogout(e: CustomEvent) {
    console.log("logout");
  }

  // Render the component's HTML template
  render() {
    return html`
      <div @np:login=${this.onAuthenticated} @np:logout=${this.onLogout} @np:error=${this.onError}>
        <h1>Demo</h1>
        <np-if>
          <np-login slot="unauthenticated" idletimeout="600"></np-login>
          <div slot="authenticated">
            <np-passkey-register></np-passkey-register>
            <np-logout></np-logout>
          </div>
          <div slot="unknown">unknown</div>
        </np-if>
        <h1>API Status</h1>
        <np-status></np-status>
        <np-status-history></np-status-history>
      </div>
    `;
  }
}

// Declare the custom element in the global HTML element tag name map
declare global {
  interface HTMLElementTagNameMap {
    "demo-sdk": DemoSdk;
  }
}
