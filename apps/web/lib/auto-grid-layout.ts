import type { Icon } from "../store/pack-slice"
export type { Icon } from "../store/pack-slice"

export interface Frame {
  iconId: string
  variant: string
  x: number
  y: number
  size: number
}

export interface GridConfig {
  gridSize: number
  padding: number
  labelHeight: number
  headerHeight: number
}

export function autoGridLayout(
  icons: Icon[],
  variants: string[],
  config: GridConfig
): Frame[] {
  const { gridSize, padding, labelHeight, headerHeight } = config
  const cellSize = gridSize + padding
  const frames: Frame[] = []

  for (const [row, icon] of icons.entries()) {
    for (const [col, variant] of variants.entries()) {
      frames.push({
        iconId: icon.id,
        variant,
        x: col * cellSize,
        y: headerHeight + row * (cellSize + labelHeight),
        size: gridSize,
      })
    }
  }

  return frames
}
