import { css } from "lit";

export default css`
  :host {
    display: flex;
    align-items: center;
    flex-flow: column;
  }

  div {
    display: flex;
    border: 1px solid black;
    padding: 1em;
    flex-flow: column;
    align-items: stretch;
    gap: 0.4em;
    width: min(100%, 300px);
  }

  div:has(np-test-button[fuck="me"]) h1 {
    color: red;
  }
`;
