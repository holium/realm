import APIConnection from '../../conduit';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { Database } from 'better-sqlite3-multiple-ciphers';
import { RealmSigner } from './signers/realm';
import { WalletDB, walletDBPreload } from './wallet.db';

export class WalletService extends AbstractService {
  public walletDB?: WalletDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('walletService', options);
    if (options?.preload) {
      return;
    }
    this.walletDB = new WalletDB({ preload: false, db });
  }

  async uqbarDeskExists(_evt: any) {
    // return await UqbarApi.uqbarDeskExists(APIConnection.getInstance().conduit);
  }

  async setPasscodeHash(passcodeHash: string) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-passcode-hash': {
          hash: passcodeHash,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async setXpub(
    network: string,
    ethPath: string,
    ourPatp: any,
    passcode: string
  ) {
    const xpub = RealmSigner.getXpub(ethPath, ourPatp, passcode);
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-xpub': {
          network,
          xpub,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async setMnemonic(mnemonic: string, ourPatp: string, passcode: string) {
    RealmSigner.setMnemonic(mnemonic, ourPatp, passcode);
  }

  async setTransaction(
    network: string,
    net: string,
    wallet: number,
    contract: string | null,
    hash: string,
    tx: any
  ) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-transaction': {
          network,
          net,
          wallet,
          contract,
          hash,
          tx,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async createWallet(sender: string, network: string, nickname: string) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'create-wallet': {
          sndr: sender,
          network,
          nickname,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async signTransaction(
    path: string,
    tx: any,
    ourPatp: string,
    passcodeString: string
  ) {
    return await RealmSigner.signTransaction(path, tx, ourPatp, passcodeString);
  }

  async sendEthereumTransaction(
    _event: any,
    walletIndex: string,
    to: string,
    amount: string,
    passcode: number[],
    toPatp?: string
  ) {
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    const protocol = this.wallet.protocols.get(
      this.state.navState.protocol
    ) as EthereumProtocol;
    const from = this.state.ethereum.wallets.get(walletIndex)?.address ?? '';
    const tx = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      gasLimit: await protocol.getFeeEstimate({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      }),
      gasPrice: await protocol.getFeePrice(),
      nonce: await protocol.getNonce(from),
      chainId: await protocol.getChainId(),
    };
    const signedTx = await this.signer.signTransaction(
      path,
      tx,
      this.state.ourPatp ?? '',
      passcode.map(String).join('')
    );
    const hash = await (
      this.wallet.protocols.get(
        this.state.navState.protocol
      ) as BaseBlockProtocol
    ).sendTransaction(signedTx);
    const currentWallet = this.state.currentWallet as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state.navState.protocol,
      hash,
      tx.to,
      toPatp,
      fromAddress,
      tx.value,
      new Date().toISOString()
    );
    const stateTx = currentWallet.data
      .get(this.state.navState.protocol)
      ?.transactionList.getStoredTransaction(hash);

    await WalletApi.setTransaction(
      this.core.conduit,
      'ethereum',
      this.state.navState.protocol,
      currentWallet.index,
      null,
      hash,
      stateTx
    );
  }
}

export default WalletService;

// Generate preload
const walletServiceInstance = WalletService.preload(
  new WalletService({ preload: true })
);

export const walletPreload = {
  ...walletServiceInstance,
  ...walletDBPreload,
};
