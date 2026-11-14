import '@testing-library/jest-dom';

/**
 * 測試環境的 localStorage 墊片
 *
 * Node 22+ 把 localStorage 定義成「需要 --localstorage-file 才有」的全域，
 * 在 jsdom 環境下取用會拿到 undefined，任何 import 到 store 的測試都會在
 * 模組初始化時就炸（gameStore 的 DEFAULT_GAME_PREFS 會讀 localStorage）。
 * 這裡補一個最小可用實作，讓「測 store 行為」這件事變得可能。
 */
if (typeof globalThis.localStorage === 'undefined' || globalThis.localStorage === null) {
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: shim, configurable: true });
  Object.defineProperty(window, 'localStorage', { value: shim, configurable: true });
}
