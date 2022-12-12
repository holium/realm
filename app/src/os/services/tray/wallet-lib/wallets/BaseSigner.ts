export abstract class BaseSigner {
  abstract signTransaction(path: string, transaction: any): any;
  abstract getXpub(path: string): string;
}
