/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface RecaptchaProps
    extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["div"]> {
    /**
     * Google recaptcha site key
     * @default ""
     */
    siteKey?: string;

    /**
     * Specify the placeholder text
     * @default "{'bottomright'} | {'bottomleft'} | {'inline'}"
     */
    badge?: string;

    /**
     * Set to `true` to enable invisible recaptcha
     * @default "{'invisible'} | {'normal'} | {'compact'}"
     */
    size?: string;
}

export default class TextInput extends SvelteComponentTyped<
    RecaptchaProps,
    {
        success: CustomEvent<any>;
        error: CustomEvent<any>;
        expired: CustomEvent<any>;
        close: CustomEvent<any>;
        ready: CustomEvent<any>;
    },
    { labelText: {} }
> {}
