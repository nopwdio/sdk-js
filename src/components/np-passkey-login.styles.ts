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

  input:hover {
    --input-border-color: var(--np-core-color-grey-m);
  }

  input:focus {
    --input-border-color: var(--np-core-color-grey-s);
  }
`;
