// Declare all untyped modules here
// following this article: https://medium.com/@steveruiz/using-a-javascript-library-without-type-declarations-in-a-typescript-project-3643490015f3
declare module '@pollinations/ipfs/awsPollenRunner.js' {
  type IPFSValue = string | number | boolean | undefined;
  interface Data {
    [key: string]: IPFSValue;
    '.cid': string | undefined;
    attempt: number;
    input: {
      model_image: string;
      [key: string]: IPFSValue;
    };
    input_cid: string;
    output: {
      done: boolean;
      log: string;
      time_start: number;
      success: boolean;
      [key: string]: IPFSValue;
    };
  }
  export async function* runModelGenerator(
    inputs: any,
    image: string = 'voodoohop/dalle-playground'
  ): AsyncGenerator<Data, void, unknown>;
}
declare module '@pollinations/ipfs/test.js' {
  export function testFunction(): 2;
}
