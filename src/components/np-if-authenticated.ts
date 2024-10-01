import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
import styles from "./np-logout.styles.js";

import { addSessionStateChanged, removeSessionStateChanged, Session } from "../core/session.js";

/**
 * @summary Renders the slotted element only if authenticated.
 *
 * @slot - The slotted elements to render if authenticated.
 */
@customElement("np-if-authenticated")
export class NpIfAuthenticated extends LitElement {
  @property({ type: Boolean }) isAuthenticated: boolean | undefined = undefined;

  constructor() {
    super();
    this.sessionStateListener = this.sessionStateListener.bind(this);
  }

  async connectedCallback() {
    super.connectedCallback();
    addSessionStateChanged(this.sessionStateListener);
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    removeSessionStateChanged(this.sessionStateListener);
  }

  private sessionStateListener(session: Session | null) {
    this.isAuthenticated = session !== null;
  }

  render() {
    return this.isAuthenticated ? html`<slot></slot>` : html``;
  }

  static styles = [core, component, styles];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-if-authenticated": NpIfAuthenticated;
  }
}
