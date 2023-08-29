<!------------------------------------------------- definition ----;

          ,\       Component: Recaptcha.svelte
         \\\,_
          \` ,\    Externally loads Google Recaptcha with defer and
     __,.-" =__)   async to avoid rendering issues. Once on:load
   ."        )     fires, our component will attach `recaptcha`
,_/   ,    \/\_    object back to svelte.
\_|    )_-\ \_-`
   `-----` `--`    Exports { Recaptcha, recaptcha, observer} as module
                   which can then be accessed by parent components.

|-----------------------------------------------------------------┐
                                                               └-->
<script context="module">
import { defer } from "./lib";

//svelte-ignore unused-export-let
export let recaptcha;
/*google method, gives you recaptcha.execute()*/

//svelte-ignore unused-export-let
export let observer = defer();
/*captcha observer, tracks recaptcha.execute*/
    
export let theme = 'dark'; // or dark
</script>

<!----------------------------------------------------------------┐
                                                               └-->
<script>
import { createEventDispatcher } from "svelte";
import { onMount, onDestroy } from "svelte";
import { default as createDebug } from "debug";
import { browser } from "./lib";

const dbg = createDebug("{Recaptcha}");
const debug = dbg;
const dispatch = createEventDispatcher();

export let sitekey;

export let badge = "top";
/*inline|bottomleft|bottomright*/

export let size = "invisible";
/*invisible|normal|compact*/

export let sleepTime = 0;
/*wait time before starting injection*/

let instanceId = null;
/*behold the recaptcha instance*/

let retryTimer = null;
/*setInterval tracker for captcha*/

let wait = null;
/*promise to wait*/

let recaptchaModal = null;
/*div that houses recaptcha iframe*/

let iframeSrc = "google.com/recaptcha/api2/bframe";
/*src path of google's injected iframe - used with the timer*/

let openObserver = null;
/*observer tracker*/

let closeObserver = null;
/*observer tracker*/

/*---------------------------------------------| dispatchers |--*/

const eventEmitters = {
    onExpired: async () => {
        debug("expired?");
        recaptcha.reset(instanceId);
    },
    onError: async (err) => {
        const debug = dbg.extend("onError");
        debug("an error occured during initialization");
        dispatch("error", { msg: "please check your site key" });
        captcha.errors.push("empty");
        recaptcha.reset(instanceId);
    },
    onSuccess: async (token) => {
        const debug = dbg.extend("onSuccess");
        debug("dispatching success, we have a token");
        dispatch("success", { msg: "ok", token: token });

        setTimeout(() => recaptcha.reset(instanceId), 1000);
        debug("resetting, google needs allowed time if visible recaptcha..");

        observer = defer();
        debug("resetting observer");
    },
    onReady: () => {
        const debug = dbg.extend("onReady");
        dispatch("ready");
        debug("captcha is ready and available in DOM");
    },
    onOpen: (mutations) => {
        const debug = dbg.extend("onOpen");
        dispatch("open");
        debug("captcha decided to ask a challange");
    },
    onClose: (mutations) => {
        const debug = dbg.extend("onClose");
        if (browser && mutations.length === 1 && !window.grecaptcha.getResponse()) {
            debug("captcha window was closed");
            dispatch("close");
        } /*
           │close mutation fires twice, probably because
           │of event bubbling or something. we also want
           │to avoid signalling when user solves the captcha.
           */
    },
}; /*
    │these emitters are referenced to google recaptcha so
    │we can track its status through svelte.
    */

/*------------------------------------------| event-handlers |--*/

const captcha = {
    ready: false,
    /*captcha loading state*/

    errors: [],

    retryTimer: false,
    /*setInterval timer to update state*/

    isLoaded: () => {
        const debug = dbg.extend("isLoaded");
        captcha.ready =
            browser &&
            window &&
            window.grecaptcha &&
            window.grecaptcha.ready &&
            document.getElementsByTagName("iframe").find((x) => {
                return x.src.includes(iframeSrc);
            })
                ? true
                : false;
        debug("captcha.isLoaded(): " + captcha.ready);
        return captcha.ready;
    },
    stopTimer: () => {
        const debug = dbg.extend("stopTimer");
        debug("stopping timer");
        clearInterval(captcha.retryTimer);
    },
    startTimer: () => {
        const debug = dbg.extend("startTimer");
        debug("check in 1s intervals");

        captcha.retryTimer = setInterval(() => {
            debug("checking every second");
            if (captcha.isLoaded()) {
                captcha.stopTimer();
                captcha.modal();
                captcha.openHandle();
                captcha.closeHandle();
                eventEmitters.onReady();
            }

            if (captcha.errors.length > 3) {
                captcha.wipe();
                debug("too many errors, no recaptcha for you at this  time");
            }
        }, 1000);
    },

    modal: () => {
        const debug = dbg.extend("modal");
        debug("finding recaptcha iframe");

        const iframe = document.getElementsByTagName("iframe");
        recaptchaModal = iframe.find((x) => {
            return x.src.includes(iframeSrc);
        }).parentNode.parentNode;
    },

    openHandle: () => {
        const debug = dbg.extend("openHandler");
        debug("adding observer");

        openObserver = new MutationObserver((x) => {
            return recaptchaModal.style.opacity == 1 && eventEmitters.onOpen(x);
        });

        openObserver.observe(recaptchaModal, {
            attributes: true,
            attributeFilter: ["style"],
        });
    },

    closeHandle: () => {
        const debug = dbg.extend("closeHandle");
        debug("adding observer");

        closeObserver = new MutationObserver((x) => {
            return recaptchaModal.style.opacity == 0 && eventEmitters.onClose(x);
        });
        closeObserver.observe(recaptchaModal, {
            attributes: true,
            attributeFilter: ["style"],
        });
    },

    inject: () => {
        const debug = dbg.extend("inject");
        debug("initializing API, merging google API to svelte recaptcha");

        recaptcha = window.grecaptcha;
        /*
         │associate window component to svelte, this allows us
         │to export grecaptcha methods in parent components.
         */

        window.grecaptcha.ready(() => {
            instanceId = grecaptcha.render("googleRecaptchaDiv", {
                "badge": badge,
                "sitekey": sitekey,
                "callback": eventEmitters.onSuccess,
                "expired-callback": eventEmitters.onExpired,
                "error-callback": eventEmitters.onError,
                "size": size,
            });
        });
    },
    wipe: () => {
        const debug = dbg.extend("onDestroy");
        try {
            if (browser) {
                clearInterval(captcha.retryTimer);
                debug("cleaning up clearInterval");

                if (recaptcha) {
                    recaptcha.reset(instanceId);
                    debug("resetting captcha api");

                    delete window.grecaptcha;
                    delete window.apiLoaded;
                    delete window.recaptchaCloseListener;
                    debug("deleting window.grecaptcha");

                    if (openObserver) openObserver.disconnect();
                    if (closeObserver) closeObserver.disconnect();
                    document
                        .querySelectorAll("script[src*=recaptcha]")
                        .forEach((script) => {
                            script.remove();
                            debug("deleting google script tag");
                        });
                    document
                        .querySelectorAll("iframe[src*=recaptcha]")
                        .forEach((iframe) => {
                            iframe.remove();
                            debug("deleting google iframe");
                        });
                }
            }
        } catch (err) {
            console.log(err.message);
        } /*
           │extremely important to cleanup our mess, otherwise
           │everytime the component is invoked, a new recaptcha
           │iframe will get instated. Also, with SSR we need to
           │make sure all this stuff is wrapped within browser.
           */
    },
};

const apiLoaded = async () => {
    const debug = dbg.extend("apiLoaded");
    debug("invoked, resolving deferred promise");
    wait.resolve(true);
};

onMount(async () => {
    const debug = dbg.extend("onMount");

    if (browser) window.apiLoaded = apiLoaded;
    debug("associate apiLoad to window object");

    if (sleepTime) {
        debug("sleeping for a bit before inserting recaptcha script");
        await sleep(sleepTime);
    }

    if (browser) {
        const script = document.createElement("script");
        script.id = "googleRecaptchaScript";
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit&sitekey{sitekey}&onload=apiLoaded`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    wait = defer();
    debug("waiting for google api to finish loading");

    await Promise.resolve(wait);
    debug("deferred promise was resolved...");

    if (browser) captcha.inject();
    debug("injecting captcha code");

    if (browser) HTMLCollection.prototype.find = Array.prototype.find;
    /*needed to detect iframe for open, close events*/

    captcha.startTimer();
    debug("polling for captcha to appear in DOM");
});

onDestroy(async () => {
    const debug = dbg.extend("onDestroy");
    captcha.wipe();
});

const sleep = (seconds) =>
    new Promise((resolve) => setTimeout(resolve, seconds * 1000)).catch((err) =>
        console.log("caught")
    );
</script>

<!----------------------------------------------------------------┐
                                                               └-->

<div id="googleRecaptchaDiv" class="g-recaptcha" data-theme={theme} />

<!--------------------------------------------------- comments ----;

   |\/\/\/|     Google's recaptcha, or reCaptcha, or gReCaptcha
   |      |     or greCaptcha is a valuable tool in defending your
   | (o)(o)     webforms.
   C      _)
    |   /       Final Update: There are different ways to inject
   /____\       a piece of javascript into a template. They all come
  /      \      with their own drawbacks.


  These drawbacks are mostly related to injecting code too fast,
  too slow, not slow enough, not fast enough, and not being able to
  tell if the injection has completed and the script api is
  available for consumption.

  1.Inject with svelte:head
  --------------------------
  This works most of the time, but it could have problems during
  component rerendering and cleanup. Like we have done in the demo,
  when the user switches between different captcha methods, plain
  svelte:head would fail.

    ...

    const recaptchaScriptId =
        browser && window.document.getElementById("googleRecaptchaScript");
    /*script src-id for recaptcha to avoid duplicate injections*/

    ...

    <svelte:head>
        {#await sleep(sleepTime) then _}
            {#if browser && !recaptchaScriptId}
                <script
                    id="googleRecaptchaScript"
                    src="https://www.google.com/recaptcha/api.js?render=explicit&sitekey{sitekey}&language={language}&onload=apiLoaded"
                    async
                    defer>
                </script>
            {/if}
        {:catch error}
            <meta wtf="true" />
        {/await}
    </svelte:head>

  That await upthere doesn't really wait for the sleep, but it
  seems to trigger the necessary gap for this to work with forcing
  rerenders.

  Besides that, this was the most straight forward approach.


  2.Write to document
  ---------------------------
  Very straight forward, works fine with forcing dynamic rerender.
  It injects and cleans up artifacts smoothly, but when it comes
  to creating the link between svelte and 3rd party script, it
  could try to do it too fast, and we would get an "undefined"
  `recaptcha` export.

  To circumvent the problem, we not only track the script load state
  with our custom observer, but also track if the google `recaptcha`
  is actually available and ready to be consumed via using good old
  setInterval.


  3.Rendering of reCaptcha
  ---------------------------
  Google fills in a destination you provide with the recaptcha
  button, that is if you are using one of the normal or compact
  sizes.

  Our div is called `googleRecaptchaDiv` and we are rendering it
  through window.grecaptcha provided by google. This is when we
  let recaptcha know about our event emitters and what to do for
  each case.

  Finally, the callback functions for the recaptha object
  could be defined in the div tag probably in another universe.

  <div id="recaptcha" class="g-recaptcha"
      data-callback="onSuccess"
      data-error-callback="onError"
      data-expired-callback="onExpired"
      data-size={invisible ? "invisible" : ""}


  Flow of Events
  ---------------------------
  .inject script and provide google a function to callback onLoad
  .start waiting
  .onLoad -> apiOnLoad proceed
  .wait for recaptcha to become available
  .render 3rd party API
  .fire events to keep svelte in loop.


  Notes to Future Self
  ---------------------------
  Remind yourself to smile whether you are reading, writing or coding.
  Especially when coding.


  Notes to Fellow Programmer
  ---------------------------
  Same. Hope you find this useful.

|------------------------------------------------------------------>
