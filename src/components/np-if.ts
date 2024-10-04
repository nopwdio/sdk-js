import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { core } from "../internal/styles/core.styles.js";
import { component } from "../internal/styles/semantic.styles.js";
import styles from "./np-logout.styles.js";

import { addSessionStateChanged, removeSessionStateChanged, Session } from "../core/session.js";

/**
 * @summary Renders the slotted element only if authenticated.
 *
 * @slot authenticated - The slotted elements to render when a user is logged in.
 * @slot unauthenticated - The slotted elements to render when no one is logged in.
 * @slot unknown - The slotted elements to render when the session verification is in progress.
 */
@customElement("np-if")
export class NpIf extends LitElement {
  @property({ type: Object }) session: Session | null | undefined = undefined;

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

  private sessionStateListener(session: Session | null | undefined) {
    this.session = session;
  }

  render() {
    if (this.session) {
      return html`<slot name="authenticated"></slot>`;
    }

    if (this.session === null) {
      return html`<slot name="unauthenticated"></slot>`;
    }

    return html`<slot name="unknown"></slot>`;
  }

  static styles = [];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-if": NpIf;
  }
}
