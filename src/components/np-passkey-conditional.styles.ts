import { css } from "lit";

export default css`
  :host {
    display: flex;
  }

  :host {
    --input-text-color: var(--np-core-color-black);
    --input-background-color: transparent;
    --input-border-color: var(--np-core-color-grey-l);
  }
  :host([state="verifying"]) :is(input, input:focus, input:hover) {
    animation: blink 200ms ease-out infinite alternate;
  }

  @keyframes blink {
    0% {
      border-color: var(--np-core-color-grey-l);
    }
    100% {
      border-color: var(--np-core-color-grey-s);
    }
  }

  input:hover {
    --input-border-color: var(--np-core-color-grey-m);
  }

  input:focus {
    --input-border-color: var(--np-core-color-grey-s);
  }
`;
