import { css } from "lit";

export default css`
  :host {
    display: flex;
  }

  :host {
    --button-text-color: var(--np-core-color-white);
    --button-background-color: var(--np-core-color-black);
  }

  /* button busy */
  :host([state="loggingout"]) {
    --button-background-color: transparent;
    --button-text-color: var(--np-core-color-grey-m);
  }

  /* button success */
  :host([state="loggedout"]) {
    --button-background-color: var(--np-core-color-green-m);
    --button-text-color: var(--np-core-color-white);
  }

  /* button error */
  :host([state="error"]) {
    --button-background-color: var(--np-core-color-red-m);
    --button-text-color: var(--np-core-color-white);
  }

  .icon {
    width: var(--np-core-font-size-m);
  }

  .icon--loading {
    animation: scale 300ms ease-out infinite alternate;
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
