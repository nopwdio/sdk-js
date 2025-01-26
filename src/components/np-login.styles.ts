import { css } from "lit";

export default css`
  :host {
    display: flex;
    overflow: hidden;

    border: solid var(--np-component-border-color) var(--np-component-border-width);
    border-radius: var(--np-component-border-radius);
  }

  :host {
    --np-component-border-color: var(--np-core-color-grey-m);
  }

  :host(:hover) {
    --np-component-border-color: var(--np-core-color-grey-s);
  }

  :host(:focus) {
    --np-component-border-color: var(--np-core-color-grey-xs);
  }

  :host([state="authenticated"]) {
    --np-component-border-color: var(--np-core-color-green-m);
  }

  :host([state="error"]) {
    --np-component-border-color: var(--np-core-color-red-m);
  }

  input,
  button {
    display: flex;

    border: none;
    outline: none;

    margin: 0;
    padding: var(--np-component-padding);
    font-size: var(--np-component-font-size);
    font-weight: var(--np-component-font-weight);

    background-color: var(--np-component-background-color);
  }

  input {
    flex-grow: 1;
    color: var(--np-component-text-color);
  }

  button {
    color: var(--np-component-text-color);
  }
`;
