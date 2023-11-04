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
  :host([state="requesting"]),
  :host([state="verifying"]) {
    --button-background-color: transparent;
    --button-text-color: var(--np-core-color-grey-m);
  }

  /* button waiting */
  :host([state="requested"]) {
    --button-background-color: transparent;
    --button-text-color: var(--np-core-color-black);
  }

  /* button success */
  :host([state="authenticated"]) {
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

  .icon--envelope {
    animation: bounce 1000ms ease-out 10;
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

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-0.4em);
    }
    60% {
      transform: translateY(-0.2em);
    }
  }
`;
