import { html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement("np-auth")
export class NpAuth extends LitElement {
  render() {}
}

declare global {
  interface HTMLElementTagNameMap {
    "np-auth": NpAuth;
  }
}
