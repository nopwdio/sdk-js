import { css } from "lit";

export default css`
  :host {
    display: flex;
    align-items: center;
    flex-flow: column;
  }

  div {
    display: flex;
    flex-flow: column;
    gap: 1em;
    width: min(100%, 300px);
  }
`;
