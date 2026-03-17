// Type declarations for the File System Access API (Chrome/Edge only)
// https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite"
}

interface FileSystemHandle {
  readonly kind: "file" | "directory"
  readonly name: string
  isSameEntry(other: FileSystemHandle): Promise<boolean>
  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: "file"
  getFile(): Promise<File>
  createWritable(): Promise<FileSystemWritableFileStream>
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: "directory"
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>
  keys(): AsyncIterableIterator<string>
  values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>
  entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string | WriteParams): Promise<void>
  seek(position: number): Promise<void>
  truncate(size: number): Promise<void>
}

interface WriteParams {
  type: "write" | "seek" | "truncate"
  data?: BufferSource | Blob | string
  position?: number
  size?: number
}

interface ShowDirectoryPickerOptions {
  id?: string
  mode?: "read" | "readwrite"
  startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | FileSystemHandle
}

interface Window {
  showDirectoryPicker(options?: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>
}
