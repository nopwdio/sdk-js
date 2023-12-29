# Nopwd javascript sdk

To all who come here... welcome!

This is the repo for our javascript sdk.
This repo contains all the source code we use to build our js library.

## What is it?

Nopwd is a set of **web components** and API to authenticate your users using email link or Passkeys authentication.

> Nopwd is still in beta. API and components may change and not production ready at this time.

Check out our [demo website](https://nopwd.rocks) to see it live :)

## Why?

Authentication is used to be hard for users but also for developers. At Nopwd, we work hard to keep our API simple and minimal 💆.
Using Nopwd, you won’t have to:

- give us money (but you can still support us 😅)
- register your app or website
- manage any API Key or secrets

## How to install it?

You can load our web components via CDN or by installing it locally using package manager such as NPM.

### using CDN

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-email-auth.js"
></script>
```

### using NPM

```bash
npm i @nopwdio/sdk-js@latest
```

## How to add magic-link authentication?

```html
<np-email-auth></np-email-auth>

<!-- importing the component using CDN -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-email-auth.js"
></script>

<script type="module">
  // If you use CDN, ensure the component is loaded before interacting with it.
  await customElements.whenDefined("np-email-auth");

  const button = document.querySelector("np-email-auth");

  // set the email property with the user's email...
  button.email = "...";

  // ...and retrieve the access token by listening the "np:login" event. You're done!
  button.addEventListner("np:login", (e) => {
    // Your are authenticated 🎉
    const { expires_at, token } = e.detail;
  });
</script>
```

## How to add Passkeys authentication?

```html
<np-passkey-conditional></np-passkey-conditional>

<!-- import the component using CDN -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-passkey-conditional.js"
></script>

<script type="module">
  // If you use CDN, ensure the component is loaded before interacting with it.
  await customElements.whenDefined("np-passkey-conditional");

  const input = document.querySelector("np-passkey-conditional");

  input.addEventListner("np:login", (e) => {
    // Your are authenticated 🎉
    const { expires_at, token } = e.detail;
  });
</script>
```

## New contributors welcome!

You can create a new Issue puts a problem on our radar or a pull request!

## What's next?

[Read the full documentation](https://dev.nopwd.io)
