// src/types/flexsearch.d.ts
declare module 'flexsearch' {
  export class Index<T = number | string> {
    constructor(options?: any)
    add(id: T, text: string): void
    search(query: string): T[]
  }
  const FlexSearch: { Index: typeof Index }
  export default FlexSearch
}
