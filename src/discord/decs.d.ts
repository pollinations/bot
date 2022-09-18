import 'discord.js';
import type { Pollination } from './commands/pollination/index.js';
import type { Store } from './store.js';
// Declare all untyped modules here
// following this article: https://medium.com/@steveruiz/using-a-javascript-library-without-type-declarations-in-a-typescript-project-3643490015f3
declare module '@pollinations/ipfs/awsPollenRunner.js' {
  export async function* runModelGenerator(
    inputs: any,
    image: string = 'voodoohop/dalle-playground'
  ): AsyncGenerator<any, void, unknown>;
}

declare module 'discord.js' {
  export interface Client {
    store: Store;
  }
}
