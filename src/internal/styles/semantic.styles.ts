import { css } from "lit";

export const button = css`
  button {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    outline: none;

    /** better center text */
    line-height: 1em;

    /* common style */
    gap: var(--np-core-icon-gap);
    padding: var(--np-core-padding-s) var(--np-core-padding-l);
    font-size: var(--np-core-font-size-m);
    font-weight: var(--np-core-font-weight-l);
    border: solid transparent var(--core-border-width-xs);
    border-radius: var(--np-core-border-radius-s);

    /* we expose button variable */
    color: var(--button-text-color);
    border-color: var(--button-border-color);
    background: var(--button-background-color);

    transition: all 100ms ease;
  }

  /* avoid icon to shrink */
  button .icon {
    flex-shrink: 0;
  }

  :host([state="error"]) {
    animation: shake 300ms 1 linear;
  }

  @keyframes shake {
    0% {
      -webkit-transform: translate(20px);
    }
    20% {
      -webkit-transform: translate(-20px);
    }
    40% {
      -webkit-transform: translate(10px);
    }
    60% {
      -webkit-transform: translate(-10px);
    }
    80% {
      -webkit-transform: translate(5px);
    }
    100% {
      -webkit-transform: translate(0px);
    }
  }
`;

export const input = css`
  input {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    outline: none;

    /* common style */
    padding: var(--np-core-padding-s);
    font-size: var(--np-core-font-size-m);
    border: solid transparent var(--np-core-border-width-xs);
    border-radius: var(--np-core-border-radius-s);

    /* we expose input variables */
    color: var(--input-text-color);
    border-color: var(--input-border-color);
    background: var(--input-background-color);

    transition: all 100ms ease;
  }
`;
