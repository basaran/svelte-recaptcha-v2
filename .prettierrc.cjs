module.exports = {
    trailingComma: "es5",
    tabWidth: 4,
    semi: true,
    printWidth: 90,
    useTabs: false,
    singleQuote: false,
    quoteProps: "consistent",
    // htmlWhitespaceSensitivity: "ignore",
    overrides: [
        {
            files: ["*.svelte", "*.set"],
            options: {
                printWidth: 90,
                svelteSortOrder: "scripts-markup-options-styles",
                svelteStrictMode: false,
                svelteBracketNewLine: false,
                svelteAllowShorthand: false,
                svelteIndentScriptAndStyle: false,
            },
        },
        {
            files: "*.vue",
            options: {
                parser: "vue",
            },
        },
        {
            files: "*.pug",
            options: {
                parser: "vue",
                pugTabWidth: 8,
                pugPrintWidth: 90,
                pugSingleFileComponentIndentation: false,
                pugWrapAttributesThreshold: 3,
                pugClassNotation: "as-is",
                pugWrapAttributesPattern: "^v-(if|else|for)",
                pugSortAttributes: "asc",
                pugClosingBracketPosition: "last-line",
            },
        },
        {
            files: "*.cjs",
            options: {
                parser: "babel",
            },
        },
        {
            files: ["*.html", "legacy/**/*.js", "*.css", "*.scss"],
            options: {
                tabWidth: 4,
            },
        },
    ],
};

/*-------------------------------------------------------- references ---;

https://github.com/prettier/plugin-pug

https://github.com/sveltejs/prettier-plugin-svelte#options

https://prettier.io/docs/en/options.html#parser

/*----------------------------------------------------------------------*/
