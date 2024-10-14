import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { addSessionStateChanged, removeSessionStateChanged, Session } from "../core/session.js";

export enum State {
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  UNKNOWN = "unknown",
}

/**
 * @summary Renders the slotted element only if authenticated.
 *
 * @slot authenticated - The slotted elements to render when a user is logged in.
 * @slot unauthenticated - The slotted elements to render when no one is logged in.
 * @slot unknown - The slotted elements to render when the session verification is in progress.
 */
@customElement("np-if")
export class NpIf extends LitElement {
  @property() state: State = State.UNKNOWN;

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
    switch (session) {
      case undefined:
        this.state = State.UNKNOWN;
        break;
      case null:
        this.state = State.UNAUTHENTICATED;
        break;
      default:
        this.state = State.AUTHENTICATED;
    }
  }

  render() {
    switch (this.state) {
      case State.UNKNOWN:
        return html`<slot name="unknown"></slot>`;
      case State.AUTHENTICATED:
        return html`<slot name="authenticated"></slot>`;
      case State.UNAUTHENTICATED:
        return html`<slot name="unauthenticated"></slot>`;
    }
  }

  static styles = [];
}

declare global {
  interface HTMLElementTagNameMap {
    "np-if": NpIf;
  }
}
