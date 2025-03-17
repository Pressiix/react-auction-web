interface LocalStorageItem {
  value: any;
  expiry: number | null;
}

// Set an item in localStorage, with JSON serialization and TTL support
export const setLocalStorageItem = (
  key: string,
  value: any,
  ttl?: number,
): void => {
  const defaultTTL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  ttl = ttl ?? defaultTTL;

  if (typeof window !== "undefined") {
    try {
      const item: LocalStorageItem = {
        value,
        expiry: ttl ? Date.now() + ttl : null,
      };
      const serializedValue = JSON.stringify(item);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }
};

// Get an item from localStorage, with JSON deserialization and TTL support
export const getLocalStorageItem = (key: string): any | null => {
  if (typeof window !== "undefined") {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }

      const item: LocalStorageItem = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return null;
    }
  }
  return null;
};
