import { css } from "lit";

export default css`
  :host {
    display: flex;
    border: solid var(--theme-color) var(--np-core-border-width-xs);
    border-radius: var(--np-core-border-radius-m);
    overflow: hidden;
  }

  :host,
  :host([state="ready"]) {
    --theme-color: var(--np-core-color-black);
  }

  :host([state="authenticated"]) {
    --theme-color: var(--np-core-color-green-m);
  }

  :host([state="email:verifying"]) {
    --theme-color: var(--np-core-color-green-m);
  }

  :host([state="error"]) {
    --theme-color: var(--np-core-color-red-m);
  }

  input,
  button {
    display: flex;

    border: none;
    outline: none;

    margin: 0;
    padding: var(--np-core-padding-s);

    font-size: var(--np-core-font-size-m);
  }

  input {
    flex-grow: 1;
  }

  button {
    background-color: transparent;
    color: var(--theme-color);
    align-items: center;
  }

  .icon {
    width: var(--np-core-font-size-m);
  }

  .icon--envelope {
    animation: bounce 1000ms ease-out 10;
  }

  .icon--loading {
    animation: scale 300ms ease-out infinite alternate;
  }
`;
