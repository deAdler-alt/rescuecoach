// src/types/flexsearch.d.ts
declare module 'flexsearch' {
  export type TokenizeOption = 'forward' | 'reverse' | 'full' | 'strict' | string
  export interface IndexOptions {
    tokenize?: TokenizeOption
    [key: string]: unknown
  }

  export class Index<T = number> {
    constructor(options?: IndexOptions)
    add(id: T, text: string): void
    search(query: string): T[]
  }

  const FlexSearch: { Index: typeof Index }
  export default FlexSearch
}
