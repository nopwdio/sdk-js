import { css } from "lit";

export const component = css`
  :host {
    --np-component-padding: var(--np-core-padding-s);

    --np-component-border-radius: var(--np-core-border-radius-s);
    --np-component-border-width: var(--np-core-border-width-xs);

    --np-component-font-size: var(--np-core-font-size-m);
    --np-component-font-weight: var(--np-core-font-weight-l);

    --np-component-border-width: var(--np-core-border-width-xs);
    --np-component-icon-gap: var(--np-core-padding-s);
  }

  :host {
    --np-component-border-color: var(--np-core-color-black);
    --np-component-text-color: var(--np-core-color-black);
    --np-component-background-color: var(--np-core-color-white);
  }

  .icon {
    width: 1em;
  }

  .icon--busy {
    animation: scale var(--np-core-animation-duration-m) ease-out infinite alternate;
  }

  .icon--envelope {
    animation: bounce var(--np-core-animation-duration-l) ease-out 10;
  }
`;
