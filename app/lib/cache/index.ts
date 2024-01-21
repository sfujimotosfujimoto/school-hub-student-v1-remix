// import { LRUCache } from "lru-cache"

// const options = {
//   max: 500,
//   maxSize: 1024 * 1024 * 3, // 3MB
//   ttl: 1000 * 60 * 60 * 24 * 7,  // 1 week
// }

// interface Cache {
//   get(key: string, d?: unknown): Promise<unknown | null>
//   set(key: string, value: unknown, ttl?: number): Promise<void>
//   delete(key: string): Promise<void>
//   has(key: string): Promise<boolean>
//   clear(): Promise<void>
// }

// function createMemoryLRUCacheStorage(options: Options<string, string>) {
//   // Configure your database client...
//   let lru = new LRU<string, string>(options)

//   return createCacheStorage({
//     async set(key, data) {
//       lru.set(key, data)
//     },
//     async get(key) {
//       return lru.get(key)
//     },
//     async delete(key) {
//       lru.delete(key)
//     },
//     async has(key) {
//       return lru.has(key)
//     },
//   })
// }
