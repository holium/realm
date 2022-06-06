# Realm Wallet

The Realm Wallet is a crypto wallet that manages crypto coins on various blockchain networks. There are two parts to this: public / private key management on a user device, and a general wallet agent that runs on your Urbit ship.

## `realm-wallet-js`

Is a javascript library that can locally derive a bitcoin and eth wallet (Uqbar, and more later) from a key derived from your ships HD wallet.

```js
let wallet = RealmWallet(mnemonic: "ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal", pin: 123456, passphrase: '');
```

```
realmwallet
├── eth
│   ├── erc20
│   ├── erc721
│   └── erc1155
├── btc
└── uqbar (tbd)
```

```js
let addressBTC = wallet.deriveAddress(network: 'bitcoin')
let addressETH = wallet.deriveAddress(network: 'ethereum')
```

## Wallet agent

The wallet agent needs to be able to interface with the JS library to seed the initial wallet keypair, prepare transaction data for a wallet to sign, store a transaction queue and history for personal accounting in a `transaction-store` on the ship, and keep track of provider nodes for the JS library to send transactions to.

### Transaction flow

The process goes as such:

1. User initiates a transaction from the local wallet.
2. The wallet agent prepares transaction data (source, target, amount, etc.)
3. wallet agent adds transaction to the queue with status `needs-signing`
4. wallet agent notifies local wallets that a transaction is ready to be viewed and signed.
5. Local wallet signs transaction and sends to provider node, alerting wallet agent the transaction has been submitted to be broadcasted by the node. Wallet agent changes status to `pending`.
6. Wallet agent watches provide node via polling or another mechanism for the approval of the transaction.
7. The transaction is approved and the wallet agent sets the status of the transaction to `approved`.
8. The transaction is moved from the active queue to the history queue.

### Stores

- `transaction-queue`: pending transactions
- `transaction-history`: completed transactions
- `wallet-settings`: nicknames, limits, etc.
- `address-book`: map of urbit id -> list of addresses

## Milestones

1. Create wallet, transaction queue, history, UI integrations (Sept 22)
2. Realm smart contract integration (Nov 22)
3. Multisig support (Jan 23)
4. Uqbar integration
