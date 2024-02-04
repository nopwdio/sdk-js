import { css } from "lit";

export default css`
  :host {
    display: flex;
  }

  :host {
    --link-text-color: inherit;
  }

  /* button success */
  :host([state="operational"]) {
    --link-text-color: var(--np-core-color-green-m);
  }

  :host([state="operational"]) .icon {
    font-size: 0.6em;
    animation: glow 1500ms ease-out infinite;
  }

  :host([state="down"]) {
    --link-text-color: var(--np-core-color-red-m);
  }

  :host([state="disrupted"]) {
    --link-text-color: var(--np-core-color-orange-m);
  }

  :host(:not([state])) .icon {
    font-size: 0.6em;
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
  @keyframes glow {
    0% {
      opacity: 0.6;
    }
    30% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
`;
