export interface PackManifest {
  name: string
  version: string
  gridSize: number
  variants: string[]
  icons: IconEntry[]
}

export interface IconEntry {
  id: string
  name: string
  category: string
  tags: string[]
  files: Record<string, string>
}

export class FileSystemService {
  private constructor(
    private dirHandle: FileSystemDirectoryHandle,
    private manifest: PackManifest
  ) {}

  static async createPack(
    dirHandle: FileSystemDirectoryHandle,
    name: string,
    gridSize: number
  ): Promise<FileSystemService> {
    const manifest: PackManifest = {
      name,
      version: "1.0.0",
      gridSize,
      variants: ["outline", "filled", "duotone"],
      icons: [],
    }
    const service = new FileSystemService(dirHandle, manifest)
    await service.writeManifest(manifest)
    return service
  }

  static async importFolder(
    dirHandle: FileSystemDirectoryHandle,
    knownVariants = ["outline", "filled", "duotone"]
  ): Promise<{ service: FileSystemService; unrecognised: string[] }> {
    const { parseIconFilenames } = await import("../lib/parse-icon-filenames")

    // Collect all filenames in the folder
    const filenames: string[] = []
    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file") filenames.push(entry.name)
    }

    const { icons: parsed, unrecognised } = parseIconFilenames(filenames, knownVariants)

    // Group parsed files into IconEntry records
    const iconMap = new Map<string, IconEntry>()
    for (const { name, variant, file } of parsed) {
      const id = name
      if (!iconMap.has(id)) {
        iconMap.set(id, { id, name, category: "", tags: [], files: {} })
      }
      iconMap.get(id)!.files[variant] = file
    }

    const manifest: PackManifest = {
      name: dirHandle.name,
      version: "1.0.0",
      gridSize: 24,
      variants: knownVariants,
      icons: [...iconMap.values()],
    }

    const service = new FileSystemService(dirHandle, manifest)
    await service.writeManifest(manifest)
    return { service, unrecognised }
  }

  static async openPack(dirHandle: FileSystemDirectoryHandle): Promise<FileSystemService> {
    let fileHandle: FileSystemFileHandle
    try {
      fileHandle = await dirHandle.getFileHandle("icon-builder.json")
    } catch {
      throw new Error("icon-builder.json not found in the selected folder")
    }
    const file = await fileHandle.getFile()
    const text = await file.text()
    const manifest = JSON.parse(text) as PackManifest
    return new FileSystemService(dirHandle, manifest)
  }

  getManifest(): PackManifest {
    return this.manifest
  }

  async writeIcon(filePath: string, svg: string): Promise<void> {
    const fileHandle = await this.dirHandle.getFileHandle(filePath, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(svg)
    await writable.close()
  }

  async readIcon(filePath: string): Promise<string> {
    const fileHandle = await this.dirHandle.getFileHandle(filePath)
    const file = await fileHandle.getFile()
    return file.text()
  }

  async writeManifest(manifest: PackManifest): Promise<void> {
    this.manifest = manifest
    const fileHandle = await this.dirHandle.getFileHandle("icon-builder.json", { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(manifest, null, 2))
    await writable.close()
  }
}
