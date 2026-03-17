/**
 * In-memory mock of FileSystemDirectoryHandle for use in tests.
 * Seed files with seedFile(), then pass to FileSystemService.
 */
export class MockDirectoryHandle {
  private files = new Map<string, string>()

  seedFile(name: string, content: string) {
    this.files.set(name, content)
  }

  readFile(name: string): string | undefined {
    return this.files.get(name)
  }

  async getFileHandle(
    name: string,
    opts?: { create?: boolean }
  ): Promise<MockFileHandle> {
    if (!opts?.create && !this.files.has(name)) {
      throw new DOMException(`File not found: ${name}`, "NotFoundError")
    }
    return new MockFileHandle(name, this.files)
  }
}

class MockFileHandle {
  constructor(
    private name: string,
    private store: Map<string, string>
  ) {}

  async getFile(): Promise<{ text: () => Promise<string> }> {
    const content = this.store.get(this.name) ?? ""
    return { text: async () => content }
  }

  async createWritable(): Promise<MockWritable> {
    return new MockWritable(this.name, this.store)
  }
}

class MockWritable {
  private chunks: string[] = []

  constructor(
    private name: string,
    private store: Map<string, string>
  ) {}

  async write(data: string) {
    this.chunks.push(data)
  }

  async close() {
    this.store.set(this.name, this.chunks.join(""))
  }
}
