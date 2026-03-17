export function isBrowserSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window
}
