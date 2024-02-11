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
    animation: glow 1500ms ease-out infinite;
  }

  :host([state="offline"]),
  :host([state="down"]) {
    --link-text-color: var(--np-core-color-red-m);
  }

  :host([state="disrupted"]) {
    --link-text-color: var(--np-core-color-orange-m);
  }

  :host([state="nodata"]),
  :host([state="unknown"]) {
    --link-text-color: var(--np-core-color-grey-m);
  }

  :host([state="unknown"]) .icon {
    animation: scale 300ms ease-out infinite alternate;
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
