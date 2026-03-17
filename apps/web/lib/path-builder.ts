export interface AnchorPoint {
  x: number
  y: number
  /** Outgoing bezier control point (towards next anchor) */
  cp2?: { x: number; y: number }
  /** Incoming bezier control point (from previous anchor) */
  cp1?: { x: number; y: number }
}

function r(n: number): number {
  return Math.round(n * 100) / 100
}

/** Build an open SVG path string from an array of anchor points. */
export function buildPathString(anchors: AnchorPoint[]): string {
  if (anchors.length === 0) return ""
  const parts: string[] = [`M ${r(anchors[0]!.x)} ${r(anchors[0]!.y)}`]

  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1]!
    const curr = anchors[i]!
    if (prev.cp2 && curr.cp1) {
      parts.push(
        `C ${r(prev.cp2.x)} ${r(prev.cp2.y)} ${r(curr.cp1.x)} ${r(curr.cp1.y)} ${r(curr.x)} ${r(curr.y)}`
      )
    } else {
      parts.push(`L ${r(curr.x)} ${r(curr.y)}`)
    }
  }

  return parts.join(" ")
}

/** Build a closed SVG path string (appends Z). */
export function closedPathString(anchors: AnchorPoint[]): string {
  const open = buildPathString(anchors)
  return open ? `${open} Z` : ""
}

/**
 * Parse a simple SVG path string (M, L, C, Z) back into anchor points.
 * Supports M, L, C commands; ignores Z.
 */
export function parsePathAnchors(d: string): AnchorPoint[] {
  if (!d.trim()) return []

  const anchors: AnchorPoint[] = []
  // Tokenise: split on command letters, keeping the letter
  const tokens = d.trim().split(/(?=[MLCZmlcz])/).filter(Boolean)

  for (const token of tokens) {
    const cmd = token[0]!.toUpperCase()
    const nums = token
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)

    if (cmd === "M" && nums.length >= 2) {
      anchors.push({ x: nums[0]!, y: nums[1]! })
    } else if (cmd === "L" && nums.length >= 2) {
      anchors.push({ x: nums[0]!, y: nums[1]! })
    } else if (cmd === "C" && nums.length >= 6) {
      // C cp1x cp1y cp2x cp2y x y
      const prev = anchors[anchors.length - 1]
      if (prev) prev.cp2 = { x: nums[0]!, y: nums[1]! }
      anchors.push({
        x: nums[4]!,
        y: nums[5]!,
        cp1: { x: nums[2]!, y: nums[3]! },
      })
    }
    // Z is ignored; closed state is external
  }

  return anchors
}

/** Return a new anchor array with the anchor at `index` moved to (x, y). */
export function moveAnchor(anchors: AnchorPoint[], index: number, x: number, y: number): AnchorPoint[] {
  return anchors.map((a, i) => (i === index ? { ...a, x, y } : a))
}

/** Return a new anchor array with the anchor at `index` removed. */
export function removeAnchor(anchors: AnchorPoint[], index: number): AnchorPoint[] {
  return anchors.filter((_, i) => i !== index)
}
