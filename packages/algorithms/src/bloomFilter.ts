/**
 * Probabilistic data structure for fast concept lookup.
 * Space-efficiently checks if a concept has been encountered.
 */
export class BloomFilter {
  private size: number;
  private storage: Uint8Array;
  private hashCount: number;

  constructor(size: number = 100, hashCount: number = 3) {
    this.size = size;
    this.storage = new Uint8Array(Math.ceil(size / 8));
    this.hashCount = hashCount;
  }

  /** Simple polynomial hash function with different seeds */
  private hash(value: string, seed: number): number {
    let h = seed + 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return Math.abs(h >>> 0) % this.size;
  }

  public add(value: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const bitIndex = this.hash(value, i);
      const byteIndex = Math.floor(bitIndex / 8);
      const bitPosition = bitIndex % 8;
      this.storage[byteIndex] |= (1 << bitPosition);
    }
  }

  /** Returns true if value is POSSIBLY in the set, false if DEFINITELY NOT */
  public contains(value: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const bitIndex = this.hash(value, i);
      const byteIndex = Math.floor(bitIndex / 8);
      const bitPosition = bitIndex % 8;
      if (!(this.storage[byteIndex] & (1 << bitPosition))) {
        return false;
      }
    }
    return true;
  }
}
