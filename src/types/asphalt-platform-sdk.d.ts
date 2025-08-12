
declare module '@asphalt/platform-sdk' {
  // Re-export the local package's source so TS can resolve types correctly.
  export * from '../../packages/platform-sdk/src';
  // If the package has a default export, re-export it too (safe no-op if not).
  import def from '../../packages/platform-sdk/src';
  export default def;
}
