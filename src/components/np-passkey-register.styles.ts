import { css } from "lit";

export default css`
  :host {
    display: flex;
  }

  button {
    display: flex;
    flex-grow: 1;

    gap: var(--np-component-icon-gap);
    justify-content: center;
    align-items: center;

    margin: 0;
    padding: var(--np-component-padding);

    border: solid var(--np-component-border-color) var(--np-component-border-width);
    border-radius: var(--np-component-border-radius);

    font-size: var(--np-component-font-size);
    font-weight: var(--np-component-font-weight);

    color: var(--np-component-text-color);
    background-color: var(--np-component-background-color);
  }
`;
