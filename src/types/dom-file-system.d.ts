/**
 * File System Access API 補充宣告
 *
 * TypeScript 內建的 lib.dom 只給了 FileSystemDirectoryHandle 的基本成員，
 * 沒有 async iterator（values / entries / keys），也沒有把 kind 收斂成可辨識聯集。
 * 這裡補上實際瀏覽器（WebView2 / Chromium）已支援的部分，
 * 讓 settingsLocalFileAccess 的 for await 迴圈與 kind 判斷都能通過型別檢查。
 */
interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  keys(): AsyncIterableIterator<string>;
}
