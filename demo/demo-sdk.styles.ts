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
  }

  form {
    display: flex;
    border: 1px solid black;
    padding: 1em;
    flex-flow: column;
    align-items: stretch;
    gap: 0.4em;
    width: min(100%, 300px);
  }

  form:has(np-logout[state="loggedout"]) h1 {
    color: red;
  }

  h1 {
    color: blue;
  }

  :has(np-test[open]) h1 {
    color: red;
  }
`;
