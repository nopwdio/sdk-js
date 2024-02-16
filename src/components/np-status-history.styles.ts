import { css } from "lit";

export default css`
  :host {
    display: flex;
    gap: var(--np-core-padding-s);
    overflow-x: scroll;
  }

  :host::-webkit-scrollbar {
    display: none;
  }

  span {
    border-radius: var(--np-core-padding-xs);
    min-width: var(--np-core-padding-m);
    min-height: var(--np-core-padding-m);

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
    animation: glow 3000ms ease-out infinite alternate;
  }

  @keyframes glow {
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;
