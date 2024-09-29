import { css } from "lit";

export default css`
  :host,
  div,
  np-if-authenticated,
  np-if-unauthenticated {
    display: flex;
    align-items: center;
    flex-flow: column;
    gap: 1em;
    width: min(100%, 300px);
  }
`;
