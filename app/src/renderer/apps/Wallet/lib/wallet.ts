import { ethers } from 'ethers';

export interface Wallet {
  network: 'bitcoin' | 'ethereum';
  address: string;
  balance: string;
  conversions?: {
    usd?: string;
    cad?: string;
    euro?: string;
  };
}

type Addr = string;

export class RealmWallet {
  private hdNode?: ethers.utils.HDNode;
  private readonly ethProvider: ethers.providers.Provider =
    ethers.getDefaultProvider();

  private readonly wallets: Map<Addr, ethers.Wallet> = new Map();
  private readonly hdWallets: Map<Addr, ethers.utils.HDNode> = new Map();

  constructor() {
    console.log('constructing RealmWallet');
    this.ethProvider = new ethers.providers.JsonRpcProvider(
      'http://localhost:8545'
    );
  }

  loadWallet(mnemonic: string) {
    console.log('loading wallet');
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet;
  }

  generateWallet() {
    console.log('creating wallet');
    const wallet = ethers.Wallet.createRandom();
    this.wallets.set(wallet.publicKey, wallet);
  }

  static genWallet() {
    return ethers.Wallet.createRandom();
  }

  async generateEthWallets() {
    if (!this.hdNode) {
      console.error('no HD node imported');
      return;
    }
    this.deriveNewWallet(1);
    this.deriveNewWallet(2);
    const addrs = Array.from(this.hdWallets.keys());
    const wallets = await Promise.all(
      addrs.map(async (addr: string) => await this.getWalletMetadata(addr))
    );
    const addr0 = wallets[0].address;
    const addr1 = wallets[1].address;
    const addr2 = wallets[2].address;

    return {
      [addr0!]: wallets[0],
      [addr1!]: wallets[1],
      [addr2!]: wallets[2],
    };
  }

  async getBalance(xpub: string) {
    const bn = await this.ethProvider.getBalance(xpub);
    return ethers.utils.formatEther(bn);
  }

  importHDWallet(mnemonic: string, index: number) {
    // const wallet = ethers.Wallet.fromEncryptedJson();
    this.hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const wallet = this.hdNode.derivePath(`m/44'/60'/0'/0/${index}`);
    this.hdWallets.set(wallet.address, wallet);
    return wallet.address;
  }

  deriveNewWallet(index: number) {
    if (!this.hdNode) {
      console.error('no HD node imported');
      return;
    }
    const wallet = this.hdNode.derivePath(`m/44'/60'/0'/0/${index}`);
    this.hdWallets.set(wallet.address, wallet);
    return wallet.address;
  }

  async getWalletMetadata(xpub: string) {
    const wallet = this.hdWallets.get(xpub);
    const balance = await this.getBalance(xpub);
    return {
      network: 'ethereum',
      balance: balance.toString(),
      address: wallet?.address,
    };
  }

  async setXpub(): Promise<void> {
    // const xpub: string = this.privateKey.neuter().extendedKey;
  }
}
