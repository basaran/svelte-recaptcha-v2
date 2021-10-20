

# svelte-recaptcha-v2

[Google reCAPTCHA v2](https://developers.google.com/recaptcha/docs/display)  implementation for Svelte SPA, SSR and  sveltekit static sites.

## Features

 - [x] svelte server side rendering (SSR) friendly.
 - [x] works with sveltekit SPA, SSR and static site adapters.
 - [x] easy integration with third party form validation libraries.
 - [x] fail-safe loader to inject recaptcha.
 - [x] invisible recaptcha or checkbox recaptcha support.
 - [x] event model for intercepting various recaptcha states.
 - [x] handle all your form logic in a single submit handler.
 - [x] proper DOM cleanup (deletes recaptcha completely)
 - [x] documented, debug.js friendly source code.
 - [x] typescript definitions are included for LSP.

## Demonstration
[svelte-recaptcha-v2 demo](https://basaran.github.io/svelte-recaptcha-v2/)

## Getting Started
```bash
# install as a development dependency
pnpm install -D svelte-recaptcha-v2
```

## Basic Usage

Import the library onto your template and update your google key:

```js
import { Recaptcha, recaptcha, observer } from "svelte-recaptcha-v2";
/*
 │Recaptcha: svelte <Recaptcha> component.
 │recaptcha: google method, gives you recaptcha.execute().
 │observer: allows you to track captcha state across components.
 */

const googleRecaptchaSiteKey="replace_with_yours";

let observer;
/*binding for tracking recaptcha execution*/
```

In your form, add the component:

```svelte
<Recaptcha
    sitekey={googleRecaptchaSiteKey}
    badge={"top"}
    size={"invisible"}
    on:success={onCaptchaSuccess}
    on:error={onCaptchaError}
    on:expired={onCaptchaExpire}
    on:close={onCaptchaClose}
    on:ready={onCaptchaReady} />
</form>
```

Setup your event handlers:

```js
const onCaptchaReady = (event) => {
    console.log("recaptcha init has completed.")
    /*
     │You can enable your form button here.
     */
};

const onCaptchaSuccess = (event) => {
    userTracker.resolve(event);
    console.log("token received: " + event.detail.token);
    /*
     │If using checkbox method, you can attach your
     │form logic here, or dispatch your custom event.
     */
};

const onCaptchaError = (event) => {
    console.log("recaptcha init has failed.");
    /*
     │Usually due to incorrect siteKey.
     |Make sure you have the correct siteKey..
     */
};

const onCaptchaExpire = (event) => {
    console.log("recaptcha api has expired");
    /*
     │Normally, you wouldn't need to do anything.
     │Recaptcha should reinit itself automatically.
     */
};

const onCaptchaOpen = (event) => {
    console.log("google decided to challange the user");
    /*
     │This fires when the puzzle frame pops.
     */
};

const onCaptchaClose = (event) => {
    console.log("google decided to challange the user");
    /*
     │This fires when the puzzle frame closes.
     │Usually happens when the user clicks outside
     |the modal frame.
     */
};
```

Update your form handler:

```js
const submitHandler = async () => {
    console.log("launching recaptcha");
    recaptcha.execute();

    console.log("pending for google response");
    const event = await Promise.resolve(observer);

    const recaptchaToken = event.detail?.token ? event.detail.token : false;

    if (!recaptchaToken) {
        console.log("recaptcha is NOT OK");
        return false;
    }

    console.log("token retrieved", recaptchaToken);
};
```

## Debugging

If you would like to enable client side debugging, add `{Recaptcha}` value to your localStorage `DEBUG` key.

## Issues

If any trouble, please create an issue. PRs are most welcome.

