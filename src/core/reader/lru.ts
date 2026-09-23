/** A small least-recently-used cache on top of Map's insertion order. */
export class LruCache<K, V> {
  private readonly entries = new Map<K, V>()

  constructor(readonly capacity: number) {}

  get size(): number {
    return this.entries.size
  }

  get(key: K): V | undefined {
    const value = this.entries.get(key)
    if (value !== undefined) {
      this.entries.delete(key)
      this.entries.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    this.entries.delete(key)
    this.entries.set(key, value)
    while (this.entries.size > this.capacity) {
      this.entries.delete(this.entries.keys().next().value as K)
    }
  }

  delete(key: K): void {
    this.entries.delete(key)
  }
}
