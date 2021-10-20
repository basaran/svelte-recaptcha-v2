import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";
import pkg from "./package.json";
import strip from "@rollup/plugin-strip";
import resolve from "@rollup/plugin-node-resolve";

export default {
    input: "src/index.js",
    output: [
        { file: pkg.module, format: "es" },
        { file: pkg.main, format: "umd", name: "window", extend: true },
    ],

    plugins: [
        del({ targets: ["dist/"] }),
        svelte({
            compilerOptions: {},
        }),
        strip({
            functions: ["console.log", "debug", "dbg", "dbg.extend", "createDebug"],
            include: ["**/*.js", "**/*.svelte", "**/*.svt"],
        }),
        resolve({
            browser: false,
        }),
        commonjs(),
        terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
