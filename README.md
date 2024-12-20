# Nopwd JavaScript SDK

Welcome to the Nopwd JavaScript SDK repository!

This repository contains all the source code used to build our JavaScript library.

## What is it?

Nopwd is a set of **web components** and APIs to authenticate your users using email links or Passkeys.

> Nopwd is still in beta. The API and components may change and are not production-ready at this time.

Check out our [demo website](https://nopwd.rocks) to see it live :)

## Why?

Authentication used to be hard for users and developers. At Nopwd, we work hard to keep our API simple and minimal 💆.
Using Nopwd, you won’t have to:

- give us money (but you can still support us 😅)
- register your app or website
- manage any API keys or secrets

## How to install it?

You can load our web components via CDN or install them locally using a package manager such as NPM.

### Using CDN

```html
<!-- Import the login with magic link or Passkeys input element -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-login.js"
></script>

<!-- Import the logout button element -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-logout.js"
></script>

<!-- Import the Passkey registration button element -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-passkey-register.js"
></script>
```

### Using NPM

```bash
npm i @nopwdio/sdk-js@latest
```

Then:

```js
// Import the login with magic link or Passkeys input element
import "@nopwdio/sdk-js/dist/components/np-login.js";

// Import the logout button element
import "@nopwdio/sdk-js/dist/components/np-logout.js";

// Import the Passkey registration button element
import "@nopwdio/sdk-js/dist/components/np-passkey-register.js";
```

## How to add magic-link or Passkeys authentication?

```html
<np-login></np-login>

<script>
  const input = document.querySelector("np-login");

  input.addEventListener("np:login", (e) => {
    // You are authenticated 🎉
    const { expires_at, token } = e.target.getSession();
  });
</script>
```

## How to logout?

```html
<np-logout></np-logout>

<script>
  const button = document.querySelector("np-logout");

  button.addEventListener("np:logout", (e) => {
    // You are logged out 🎉
  });
</script>
```

## How to create a Passkey?

```html
<np-passkey-register></np-passkey-register>

<script>
  const button = document.querySelector("np-passkey-register");

  button.addEventListener("np:register", (e) => {
    // The Passkey has been created 🎉
  });
</script>
```

## New contributors welcome!

You can create a new issue to put a problem on our radar or submit a pull request!

## What's next?

[Read the full documentation](https://dev.nopwd.io)
