import { css } from "lit";

export default css`
  :host {
    display: flex;
    gap: var(--np-component-padding);
    overflow-x: scroll;
  }

  :host::-webkit-scrollbar {
    display: none;
  }

  span {
    border-radius: var(--np-component-border-radius);
    min-width: var(--np-component-font-size);
    min-height: var(--np-component-font-size);

    flex: 1;
  }

  span.down {
    background-color: var(--np-core-color-red-m);
  }
  span.nodata {
    background-color: var(--np-core-color-grey-xs);
  }
  span.disrupted {
    background-color: var(--np-core-color-orange-m);
  }
  span.operational {
    background-color: var(--np-core-color-green-m);
  }

  span.operational:nth-child(1) {
    animation: glow var(--np-core-animation-duration-xl) ease-in-out infinite alternate;
  }
`;
