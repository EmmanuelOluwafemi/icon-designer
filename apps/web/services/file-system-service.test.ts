import { describe, it, expect } from "vitest"
import { FileSystemService } from "./file-system-service"
import { MockDirectoryHandle } from "./mock-directory-handle"

const validManifest = {
  name: "My Icons",
  version: "1.0.0",
  gridSize: 24,
  variants: ["outline", "filled"],
  icons: [],
}

describe("FileSystemService.createPack()", () => {
  it("writes a fresh manifest and returns service with that manifest", async () => {
    const dir = new MockDirectoryHandle()

    const service = await FileSystemService.createPack(dir as never, "My Icons", 24)

    const manifest = service.getManifest()
    expect(manifest.name).toBe("My Icons")
    expect(manifest.gridSize).toBe(24)
    expect(manifest.variants).toEqual(["outline", "filled", "duotone"])
    expect(manifest.icons).toEqual([])

    // manifest must also be persisted to disk
    const written = dir.readFile("icon-builder.json")
    expect(written).toBeDefined()
    expect(JSON.parse(written!).name).toBe("My Icons")
  })
})

describe("FileSystemService.writeIcon()", () => {
  it("writes the SVG string to the correct file path", async () => {
    const dir = new MockDirectoryHandle()
    dir.seedFile("icon-builder.json", JSON.stringify(validManifest))
    const service = await FileSystemService.openPack(dir as never)

    await service.writeIcon("icons/arrow-up.outline.svg", "<svg>new content</svg>")

    const written = dir.readFile("icons/arrow-up.outline.svg")
    expect(written).toBe("<svg>new content</svg>")
  })
})

describe("FileSystemService.readIcon()", () => {
  it("returns the SVG string from the correct file path", async () => {
    const dir = new MockDirectoryHandle()
    dir.seedFile("icon-builder.json", JSON.stringify(validManifest))
    dir.seedFile("icons/arrow-up.outline.svg", "<svg>arrow-up outline</svg>")
    const service = await FileSystemService.openPack(dir as never)

    const svg = await service.readIcon("icons/arrow-up.outline.svg")

    expect(svg).toBe("<svg>arrow-up outline</svg>")
  })
})

describe("FileSystemService.writeManifest()", () => {
  it("serializes updated manifest to disk", async () => {
    const dir = new MockDirectoryHandle()
    dir.seedFile("icon-builder.json", JSON.stringify(validManifest))
    const service = await FileSystemService.openPack(dir as never)

    const updated = { ...validManifest, name: "Updated Pack", gridSize: 32 }
    await service.writeManifest(updated)

    const written = dir.readFile("icon-builder.json")
    expect(JSON.parse(written!)).toEqual(updated)
    expect(service.getManifest()).toEqual(updated)
  })
})

describe("FileSystemService.openPack()", () => {
  it("parses icon-builder.json and returns service with correct manifest", async () => {
    const dir = new MockDirectoryHandle()
    dir.seedFile("icon-builder.json", JSON.stringify(validManifest))

    const service = await FileSystemService.openPack(dir as never)

    expect(service.getManifest()).toEqual(validManifest)
  })

  it("throws a clear error when icon-builder.json is missing", async () => {
    const dir = new MockDirectoryHandle() // empty — no manifest seeded

    await expect(FileSystemService.openPack(dir as never)).rejects.toThrow(
      "icon-builder.json not found"
    )
  })
})
