export const browser = (() => {
    return typeof window === "object" && typeof window.document === "object";
})();
