import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock DOM APIs
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock IndexedDB
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  readyState: "done",
  source: null,
  transaction: null,
};

const mockIDBObjectStore = {
  add: vi.fn().mockReturnValue(mockIDBRequest),
  put: vi.fn().mockReturnValue(mockIDBRequest),
  get: vi.fn().mockReturnValue(mockIDBRequest),
  getAll: vi.fn().mockReturnValue(mockIDBRequest),
  delete: vi.fn().mockReturnValue(mockIDBRequest),
  createIndex: vi.fn(),
  index: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(mockIDBRequest),
    getAll: vi.fn().mockReturnValue(mockIDBRequest),
  }),
};

const mockIDBTransaction = {
  objectStore: vi.fn().mockReturnValue(mockIDBObjectStore),
  abort: vi.fn(),
  commit: vi.fn(),
  error: null,
  mode: "readwrite",
  objectStoreNames: ["test"],
  oncomplete: null,
  onerror: null,
  onabort: null,
};

const mockIDBDatabase = {
  createObjectStore: vi.fn().mockReturnValue(mockIDBObjectStore),
  deleteObjectStore: vi.fn(),
  transaction: vi.fn().mockReturnValue(mockIDBTransaction),
  close: vi.fn(),
  name: "test",
  version: 1,
  objectStoreNames: ["test"],
  onabort: null,
  onclose: null,
  onerror: null,
  onversionchange: null,
};

Object.defineProperty(window, "indexedDB", {
  writable: true,
  value: {
    open: vi.fn().mockImplementation(() => ({
      ...mockIDBRequest,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null,
      result: mockIDBDatabase,
    })),
    deleteDatabase: vi.fn().mockReturnValue(mockIDBRequest),
    databases: vi.fn().mockResolvedValue([]),
  },
});

// Mock localStorage with in-memory store
(() => {
  const store: Record<string, string> = {};
  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: {
      getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = String(value);
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(store)) delete store[k];
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    },
  });
})();

// Mock URL.createObjectURL
Object.defineProperty(window.URL, "createObjectURL", {
  writable: true,
  value: vi.fn().mockReturnValue("blob:test"),
});

Object.defineProperty(window.URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
  }),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
  }),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 0 }),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock fetch
global.fetch = vi.fn();

// Mock crypto
Object.defineProperty(window, "crypto", {
  writable: true,
  value: {
    getRandomValues: vi.fn().mockImplementation((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn().mockReturnValue("test-uuid"),
  },
});

// Mock performance
Object.defineProperty(window, "performance", {
  writable: true,
  value: {
    now: vi.fn().mockReturnValue(Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
  },
});

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("React Router") ||
      args[0].includes("Warning: ") ||
      args[0].includes("Three.js"))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ") || args[0].includes("Error: ") || args[0].includes("Three.js"))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock maplibre-gl to avoid WebGL in tests
vi.mock("maplibre-gl", () => {
  class Map {
    private _sources: Record<string, any> = {};
    private _layers: Record<string, any> = {};
    private _handlers: Record<string, Function> = {};
    constructor(opts: any) {
      // noop
      setTimeout(() => {
        if (this._handlers["load"]) this._handlers["load"]({});
      }, 0);
    }
    addControl(): void {}
    on(evt: string, cb: Function): void {
      this._handlers[evt] = cb as any;
    }
    setStyle(): void {}
    isStyleLoaded(): boolean {
      return true;
    }
    getCenter(): { lng: number; lat: number } {
      return { lng: -74, lat: 40 };
    }
    getZoom(): number {
      return 10;
    }
    remove(): void {}
    addSource(id: string, src: any): void {
      this._sources[id] = {
        data: src.data,
        setData: (d: any) => {
          this._sources[id].data = d;
        },
      };
    }
    getSource(id: string): any {
      return this._sources[id];
    }
    addLayer(layer: any): void {
      this._layers[layer.id] = layer;
    }
    getLayer(id: string): any {
      return this._layers[id];
    }
    setLayoutProperty(): void {}
  }
  class NavigationControl {}
  class GeolocateControl {}
  class ScaleControl {}
  class FullscreenControl {}
  class Marker {
    setLngLat(): this {
      return this;
    }
    addTo(): this {
      return this;
    }
    setPopup(): this {
      return this;
    }
  }
  class Popup {
    setHTML(): this {
      return this;
    }
  }
  return {
    default: {
      Map,
      NavigationControl,
      GeolocateControl,
      ScaleControl,
      FullscreenControl,
      Marker,
      Popup,
    },
  };
});
