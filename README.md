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
<!-- to import the login with magiclink or Passkeys input element -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-login.js"
></script>

<!-- to import the logout button element -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-logout.js"
></script>

<!-- to import the passkey registration button element -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@nopwdio/sdk-js@latest/cdn/components/np-passkey-register.js"
></script>
```

### using NPM

```bash
npm i @nopwdio/sdk-js@latest
```

and then:

```js
// to import the login with magiclink or Passkeys input element
import "@nopwdio/sdk-js/dist/components/np-login.js";

// to import the logout button element
import "@nopwdio/sdk-js/dist/components/np-logout.js";

// to import the passkeys registration button element
import "@nopwdio/sdk-js/dist/components/np-passkey-register.js";
```

## How to add magic-link or Passkeys authentication?

```html
<np-login></np-login>

<script>
  const input = document.querySelector("np-login");

  input.addEventListner("np:login", (e) => {
    // Your are authenticated 🎉
    const { expires_at, token } = e.target.getSession();
  });
</script>
```

## How to logout?

```html
<np-logout></np-logout>

<script>
  const button = document.querySelector("np-logout");

  input.addEventListner("np:logout", (e) => {
    // Your are logged out 🎉
  });
</script>
```

## How to create a Passkey?

```html
<np-passkey-register></np-passkey-register>

<script>
  const button = document.querySelector("np-passkey-register");

  button.addEventListner("np:register", (e) => {
    // The passkey has been created 🎉
  });
</script>
```

## New contributors welcome!

You can create a new Issue puts a problem on our radar or a pull request!

## What's next?

[Read the full documentation](https://dev.nopwd.io)
