import { css } from "lit";

export default css`
  :host {
    display: flex;
  }

  :host {
    --link-text-color: var(--np-core-color-white);
    --link-background-color: var(--np-core-color-black);
  }

  /* button busy */
  :host([state="initializing"]) {
    --link-background-color: transparent;
    --link-text-color: var(--np-core-color-grey-m);
  }

  /* button success */
  :host([state="operational"]) {
    --link-background-color: var(--np-core-color-green-m);
    --link-text-color: var(--np-core-color-white);
  }

  :host([state="down"]) {
    --link-background-color: var(--np-core-color-red-m);
    --link-text-color: var(--np-core-color-white);
  }

  :host([state="disrupted"]) {
    --link-background-color: var(--np-core-color-orange-m);
    --link-text-color: var(--np-core-color-white);
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
