import { html, fixture, expect } from "@open-wc/testing";
import "./np-email-signin";
import { State, NpEmailLogin } from "./np-email-login";
import { MockFetch } from "../api/endpoint.mock";

const sleep = function (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe("np-email-login", () => {
  it("has default inner text to equal", async () => {
    const el: NpEmailLogin = await fixture(html`<np-email-signin></np-email-signin>`);
  });

  it("does nothing if click without email", async () => {
    const el: NpEmailLogin = await fixture(html`<np-email-signin></np-email-signin>`);

    el.shadowRoot!.querySelector("button")!.click();
    expect(el.getAttribute("state")).to.be.null;
  });

  it("shows error when 400 returns", async () => {
    const el: NpEmailLogin = await fixture(html`<np-email-signin email="ada"></np-email-signin>`);

    const mock = new MockFetch("https://api.nopwd.io/v1");
    mock
      .on("POST", "/email/requests")
      .returns(async () => {
        await sleep(10);
        return { status: 400, json: {} };
      })
      .mock();

    el.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(el.getAttribute("state")).to.equal("requesting");
    await sleep(20);
    expect(el.getAttribute("state")).to.equal("error:badrequest");
  });
});
