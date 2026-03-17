export interface ParsedIconFile {
  name: string
  variant: string
  file: string
}

export interface ParseResult {
  icons: ParsedIconFile[]
  unrecognised: string[]
}

function normalise(s: string): string {
  return s.replace(/_/g, "-").toLowerCase()
}

export function parseIconFilenames(filenames: string[], knownVariants: string[]): ParseResult {
  const icons: ParsedIconFile[] = []
  const unrecognised: string[] = []

  for (const file of filenames) {
    const lower = file.toLowerCase()
    if (!lower.endsWith(".svg")) continue

    const base = file.slice(0, file.lastIndexOf(".")) // strip .svg (preserves case for split)
    const segments = base.split(".").map(normalise)

    if (segments.length === 1) {
      // name.svg → default variant
      icons.push({ name: segments[0]!, variant: knownVariants[0]!, file })
    } else if (segments.length === 2) {
      const [name, variant] = segments as [string, string]
      if (knownVariants.includes(variant)) {
        icons.push({ name, variant, file })
      } else {
        unrecognised.push(file)
      }
    } else {
      // 3+ segments — unrecognised
      unrecognised.push(file)
    }
  }

  return { icons, unrecognised }
}
