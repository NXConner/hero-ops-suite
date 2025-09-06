// Minimal shim to satisfy TypeScript diagnostics for react/jsx-runtime in tooling
// Runtime is provided by react 17+; bundlers resolve it. This avoids noisy lints.
declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  const _default: any;
  export default _default;
}
