import APIConnection from 'os/services-new/conduit';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { UqbarApi } from 'os/api/uqbar';

export class WalletService extends AbstractService {
  constructor(options?: ServiceOptions) {
    super('walletService', options);
    if (options?.preload) {
      return;
    }
    // APIConnection.getInstance().conduit.watch({
    //   app: 'rooms-v2',
    //   path: '/lib',
    //   onEvent: async (data, _id, mark) => {
    //     this.sendUpdate({ mark, data });
    //   },
    //   onError: () => console.log('rooms subscription rejected'),
    //   onQuit: () => {
    //     console.log('Kicked from rooms subscription');
    //   },
    // });
  }
  // public poke(payload: PokeParams) {
  //   return APIConnection.getInstance().conduit.poke(payload);
  // }
  // public scry(payload: Scry) {
  //   console.log('scry', payload);
  //   return APIConnection.getInstance().conduit.scry(payload);
  // }

  async getConversion(
    from: 'ETH' = 'ETH',
    to: 'USD' | 'EUR' | string = 'USD'
  ): Promise<string> {
    const result = await axios({
      method: 'get',
      url: `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`,
    });
    this.state?.ethereum.setExchangeRate(result.data[to]);
    return result.data[to];
  }
  async setMnemonic(mnemonic: string, passcode: number[]) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Failed to load conduit');

    const passcodeString = passcode.map(String).join('');
    (this.signer as RealmSigner).setMnemonic(
      mnemonic,
      this.state.ourPatp ?? '',
      passcodeString
    );
    const passcodeHash = await bcrypt.hash(passcodeString, 12);
    await WalletApi.setPasscodeHash(this.core.conduit, passcodeHash);
    const ethPath = "m/44'/60'/0'";
    const btcPath = "m/44'/0'/0'";
    const btcTestnetPath = "m/44'/1'/0'";
    let xpub: string;
    // eth
    xpub = this.signer.getXpub(
      ethPath,
      this.state.ourPatp ?? '',
      passcodeString
    );
    await WalletApi.setXpub(this.core.conduit, 'ethereum', xpub);
    // btc
    xpub = this.signer.getXpub(
      btcPath,
      this.state.ourPatp ?? '',
      passcodeString
    );
    await WalletApi.setXpub(this.core.conduit, 'bitcoin', xpub);
    // btc testnet
    xpub = this.signer.getXpub(
      btcTestnetPath,
      this.state.ourPatp ?? '',
      passcodeString
    );
    await WalletApi.setXpub(this.core.conduit, 'btctestnet', xpub);
    this.state.navigate(WalletView.LIST);
  }

  async setNetwork(network: NetworkType) {
    if (!this.state) throw new Error('Wallet state not loaded');
    this.state.navigate(WalletView.LIST);
    if (this.state.navState.network !== network) {
      this.state.setNetwork(network);
      if (!this.wallet) throw new Error('Wallet not loaded');
      this.wallet.watchUpdates(this.core.conduit, this.state);
    }
  }

  setProtocol(protocol: ProtocolType) {
    if (!this.state) throw new Error('Wallet state not loaded');
    this.state.navigate(WalletView.LIST);
    if (this.state.navState.protocol !== protocol) {
      this.state.setProtocol(protocol);
      if (!this.wallet) throw new Error('Wallet not loaded');
      this.wallet.watchUpdates(this.core.conduit, this.state);
    }
  }

  async getRecipient(patp: string): Promise<RecipientPayload> {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Failed to load conduit');

    const recipientMetadata: {
      color: string;
      avatar?: string;
      nickname?: string;
    } = await this.core.services.ship.getContact(null, patp);

    try {
      const address: any = await WalletApi.getAddress(
        this.core.conduit,
        this.state.navState.network,
        patp
      );

      return {
        patp,
        recipientMetadata,
        address: address ? address.address : null,
        gasEstimate: 7,
      };
    } catch (e) {
      console.error(e);
      return {
        patp,
        gasEstimate: 7,
        recipientMetadata: {
          color: '#000000',
        },
        address: null,
      };
    }
  }

  async saveTransactionNotes(notes: string) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Failed to load conduit');

    const network = this.state.navState.network;
    const net = this.state.navState.protocol;
    const contract =
      this.state.navState.detail?.txtype === 'coin'
        ? this.state.navState.detail.coinKey ?? null
        : null;
    const hash = this.state.navState.detail?.key ?? '';
    const index = this.state.currentWallet?.index ?? 0;
    await WalletApi.saveTransactionNotes(
      this.core.conduit,
      network,
      net,
      index,
      contract,
      hash,
      notes
    );
  }

  async setSettings(network: string, settings: UISettingsType) {
    if (!this.core.conduit) throw new Error('Failed to load conduit');
    await WalletApi.setSettings(this.core.conduit, network, settings);
  }

  async changeDefaultWallet(network: string, index: number) {
    if (!this.core.conduit) throw new Error('Failed to load conduit');
    await WalletApi.changeDefaultWallet(this.core.conduit, network, index);
  }

  async createWallet(nickname: string) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Failed to load conduit');
    const sender = this.state.ourPatp ?? '';
    let network: string = this.state.navState.network;
    if (
      network === 'bitcoin' &&
      this.state.navState.btcNetwork === NetworkStoreType.BTC_TEST
    ) {
      network = 'btctestnet';
    }
    await WalletApi.createWallet(this.core.conduit, sender, network, nickname);
    this.state.navigate(WalletView.LIST, { canReturn: false });
  }

  async enqueueUqbarTransaction(
    _walletIndex: string,
    _to: string,
    _amount: string
  ) {
    /*const from = this.state.ethereum.wallets.get(walletIndex).address;
    // const protocol = this.wallet.currentProtocol;
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
    const tx = this.state.uqTx;
    const ZIG_CONTRACT_ADDRESS = '0x74.6361.7274.6e6f.632d.7367.697a';
    const item = this.state.ethereum.wallets.get(walletIndex).data.get(this.state.navState.protocol).uqbarTokenId;
    await UqbarApi.enqueueTransaction(this.core.conduit, from, ZIG_CONTRACT_ADDRESS, '0x0', to, item, Number(amount));
    const pendingTxns = await UqbarApi.scryPending(this.core.conduit, from);
*/
  }

  async submitUqbarTransaction(
    walletIndex: string,
    passcode: number[]
    // toPatp?: string,
  ) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Failed to load conduit');
    /*const from = this.state.ethereum.wallets.get(walletIndex).address;
    const tx = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      /*gasLimit: await protocol.getFeeEstimate({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      }),*/
    // gasPrice: await protocol.getFeePrice(),
    // nonce: await protocol.getNonce(from),
    // chainId: await protocol.getChainId(),
    // };
    const uqTx = this.state?.uqTx;
    const tx = {
      ...uqTx,
      rate: 2,
      budget: 2000000,
    };
    // const ZIG_CONTRACT_ADDRESS = '0x74.6361.7274.6e6f.632d.7367.697a';
    /*const item = this.state.ethereum.wallets.get(walletIndex).data.get(this.state.navState.protocol).uqbarTokenId;
    await UqbarApi.enqueueTransaction(this.core.conduit, from, ZIG_CONTRACT_ADDRESS, '0x0', to, item, Number(amount));
    const pendingTxns = await UqbarApi.scryPending(this.core.conduit, from);
    let hash = Object.keys(pendingTxns)
      .filter(hash => pendingTxns[hash].from === addDots(from))
      .sort((a, b) => pendingTxns[a].nonce - pendingTxns[b].nonce)[0]
    console.log(hash)
    const txn = pendingTxns[hash];*/
    const path = "m/44'/60'/0'/0/0" + walletIndex;
    const contract = removeDots(tx.contract?.slice(2) ?? '');
    const to =
      (tx as any)?.action?.give?.to ||
      (tx as any)?.action?.['give-nft']?.to ||
      `0x${contract}${contract}`;
    const signed = await (this.signer as RealmSigner).signUqbarTransaction(
      path,
      tx.hash ?? '',
      { ...tx, to },
      this.state?.ourPatp ?? '',
      passcode.map(String).join('')
    );
    console.log('signed the tx');
    console.log(signed.sig);
    await UqbarApi.submitSigned(
      this.core.conduit,
      tx.from ?? '',
      tx.hash ?? '',
      tx.rate,
      tx.budget,
      signed.ethHash,
      signed.sig
    ); //signed.ethHash, signed.sig);
    console.log('submitted');
    const hash = removeDots(tx.hash ?? '');
    const currentWallet = this.state.currentWallet as EthWalletType;
    const fromAddress = currentWallet.address;
    currentWallet.enqueueTransaction(
      this.state.navState.protocol ?? '',
      hash,
      '',
      '', //toPatp,
      fromAddress,
      '',
      new Date().toISOString()
    );
    console.log('enqueued');
    const stateTx = currentWallet.data
      ?.get(this.state.navState.protocol)
      ?.transactionList.getStoredTransaction(hash);
    await WalletApi.setTransaction(
      this.core.conduit,
      'ethereum',
      this.state?.navState.protocol,
      currentWallet.index,
      null,
      hash,
      stateTx
    );
  }

  async sendEthereumTransaction(
    walletIndex: string,
    to: string,
    amount: string,
    passcode: number[],
    toPatp?: string
  ) {
    if (!this.wallet) throw new Error('Wallet not loaded');
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Conduit not loaded');

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

  async sendERC20Transaction(
    walletIndex: string,
    to: string,
    amount: string,
    contractAddress: string,
    passcode: number[],
    toPatp?: string
  ) {
    if (!this.wallet) throw new Error('Wallet not loaded');
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Conduit not loaded');

    const path = "m/44'/60'/0'/0/0" + walletIndex;
    console.log(walletIndex, to, amount, toPatp, path);

    const ethAmount = ethers.utils.parseEther(amount);
    const tx = await (
      this.wallet.protocols.get(
        this.state.navState.protocol
      ) as EthereumProtocol
    ).populateERC20(
      contractAddress,
      to,
      amount,
      this.state.ethereum.wallets
        .get(walletIndex)
        ?.data.get(this.state.navState.protocol)
        ?.coins.get(contractAddress)?.decimals ?? 0
    );
    const protocol = this.wallet.protocols.get(
      this.state.navState.protocol
    ) as EthereumProtocol;
    const from = this.state.ethereum.wallets.get(walletIndex)?.address ?? '';
    tx.from = from;
    tx.gasLimit = await protocol.getFeeEstimate(tx);
    tx.gasPrice = await protocol.getFeePrice();
    tx.nonce = await protocol.getNonce(from);
    tx.chainId = await protocol.getChainId();
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
      to,
      toPatp,
      fromAddress,
      ethAmount,
      new Date().toISOString(),
      contractAddress
    );
    const stateTx = currentWallet.data
      .get(this.state.navState.protocol)
      ?.coins.get(contractAddress)
      ?.transactionList.getStoredTransaction(hash);
    console.log(stateTx);
    await WalletApi.setTransaction(
      this.core.conduit,
      'ethereum',
      this.state.navState.protocol,
      currentWallet.index,
      contractAddress,
      hash,
      stateTx
    );
  }

  sendERC721Transaction() {}

  sendBitcoinTransaction() {}

  async checkPasscode(passcode: number[]) {
    return await bcrypt.compare(
      passcode.map(String).join(''),
      this.state?.settings.passcodeHash ?? ''
    );
  }

  async checkProviderUrl(providerURL: string): Promise<boolean> {
    try {
      const newProvider = new ethers.providers.JsonRpcProvider(providerURL);
      console.log('new provider: ', newProvider);
      const { chainId, name } = await newProvider.getNetwork();
      console.log('network name: ', name);
      console.log(`chain ID: ${chainId}`);
      if (!chainId && !name) {
        throw new Error('Invalid provider.');
      }
      return true;
    } catch {
      return false;
    }
  }

  async checkMnemonic(mnemonic: string) {
    if (!this.core.conduit) throw new Error('Conduit not loaded');

    const ethXpub = ethers.utils.HDNode.fromMnemonic(mnemonic)
      .derivePath("m/44'/60'/0'")
      .neuter().extendedKey;
    const agentEthXpub = (await WalletApi.getEthXpub(this.core.conduit))[
      'eth-xpub'
    ];
    return ethXpub === agentEthXpub;
  }

  navigate(view: WalletView, options?: WalletNavOptions) {
    if (!this.state) throw new Error('Wallet state not loaded');
    this.state.navigate(view, options);
  }

  navigateBack() {
    if (!this.state) throw new Error('Wallet state not loaded');
    this.state.navigateBack();
  }

  toggleNetwork(_evt: any) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.wallet) throw new Error('Wallet not loaded');
    if (this.state.navState.network === NetworkType.ETHEREUM) {
      if (this.state.navState.protocol === ProtocolType.ETH_MAIN) {
        this.state.setProtocol(ProtocolType.ETH_GORLI);
        this.wallet.watchUpdates(this.core.conduit, this.state);
      } else if (this.state.navState.protocol === ProtocolType.ETH_GORLI) {
        this.state.setProtocol(ProtocolType.ETH_MAIN);
        this.wallet.watchUpdates(this.core.conduit, this.state);
      }
    }
  }

  async uqbarDeskExists(_evt: any) {
    return await UqbarApi.uqbarDeskExists(APIConnection.getInstance().conduit);
  }

  toggleUqbar(_evt: any) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.wallet) throw new Error('Wallet not loaded');
    this.state.navState.protocol !== ProtocolType.UQBAR
      ? this.state.setProtocol(ProtocolType.UQBAR)
      : this.state.setProtocol(this.state.navState.lastEthProtocol);
    this.wallet.watchUpdates(this.core.conduit, this.state);
  }

  async watchUpdates(_evt: any) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.wallet) throw new Error('Wallet not loaded');
    this.wallet.watchUpdates(this.core.conduit, this.state);
  }

  async setForceActive(_evt: any, forceActive: boolean) {
    if (!this.state) throw new Error('Wallet state not loaded');
    this.state.setForceActive(forceActive);
  }

  async resetNavigation() {
    if (!this.state) throw new Error('Wallet state not loaded');
    this.state.resetNavigation();
  }

  async deleteLocalWallet(_evt: any, passcode: number[]) {
    if (!this.state) throw new Error('Wallet state not loaded');
    const passcodeString = passcode.map(String).join('');
    (this.signer as RealmSigner).deleteMnemonic(
      this.state.ourPatp ?? '',
      passcodeString ?? ''
    );
    this.db?.resetToDefaults();
  }

  async deleteShipWallet(_evt: any, passcode: number[]) {
    if (!this.state) throw new Error('Wallet state not loaded');
    if (!this.core.conduit) throw new Error('Conduit not loaded');
    const passcodeString = passcode.map(String).join('');
    (this.signer as RealmSigner).deleteMnemonic(
      this.state.ourPatp ?? '',
      passcodeString ?? ''
    );
    this.db?.resetToDefaults();
    WalletApi.initialize(this.core.conduit);
  }
}

export default WalletService;

// Generate preload
export const roomsPreload = WalletService.preload(
  new WalletService({ preload: true })
);
