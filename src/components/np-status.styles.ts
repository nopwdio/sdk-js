import { css } from "lit";

export default css`
  :host {
    display: flex;
  }

  a {
    display: flex;
    align-items: center;

    gap: var(--np-component-icon-gap);

    margin: 0;
    padding: var(--np-component-padding);

    border: solid var(--np-component-border-color) var(--np-component-border-width);
    border-radius: var(--np-component-border-radius);

    font-size: var(--np-component-font-size);
    font-weight: var(--np-component-font-weight);
    font-family: initial;

    color: var(--np-component-text-color);
    background-color: var(--np-component-background-color);
    text-decoration: none;
  }

  /* button success */
  :host([state="operational"]) {
    --np-component-border-color: var(--np-core-color-green-m);
    --np-component-text-color: var(--np-core-color-green-m);
  }

  :host([state="offline"]),
  :host([state="down"]) {
    --np-component-border-color: var(--np-core-color-red-m);
    --np-component-text-color: var(--np-core-color-red-m);
  }

  :host([state="disrupted"]) {
    --np-component-border-color: var(--np-core-color-orange-m);
    --np-component-text-color: var(--np-core-color-orange-m);
  }

  :host([state="nodata"]),
  :host([state="unknown"]) {
    --np-component-border-color: var(--np-core-color-grey-m);
    --np-component-text-color: var(--np-core-color-grey-m);
  }

  :host([state="unknown"]) .icon {
    animation: scale var(--np-core-animation-duration-m) ease-out infinite alternate;
  }

  :host([state="disrupted"]) .icon,
  :host([state="operational"]) .icon {
    animation: glow var(--np-core-animation-duration-xl) ease-in-out infinite alternate;
  }

  .icon {
    font-size: 0.7em;
  }

  @keyframes scale {
    0% {
      transform: scale(0.6);
    }
    100% {
      transform: scale(1);
    }
  }
`;
