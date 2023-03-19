import { utils, BigNumber } from 'ethers';
import {
  ERC20Type,
  ERC721Type,
  TransactionType,
} from 'os/services/tray/wallet-lib/wallet.model';

import { ThemeType } from 'renderer/logic/theme';
import { theme } from '../../../theme';

export function getDisplayDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return `${date.toLocaleDateString(
    'en-US',
    options
  )} ${date.toLocaleTimeString()}`;
}

export function getBaseTheme(currentTheme: ThemeType) {
  // @ts-expect-error
  return theme[currentTheme.mode];
}

export function shortened(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatWei(wei: string) {
  const amount = BigNumber.from(wei);
  return utils.formatEther(amount).slice(0, 7);
}

export function convertWeiToUsd(wei: string, exchangeRate: number = 1647.37) {
  const amount = BigNumber.from(wei);
  const eth = Number(utils.formatEther(amount));
  const usd = eth * exchangeRate;

  return usd.toFixed(2);
}

export function getTransactions(
  transactionMap: Map<string, TransactionType>,
  address?: string,
  _coin?: ERC20Type | null
): TransactionType[] {
  const addressFilter = (transaction: TransactionType) => {
    return address ? transaction.ourAddress === address : true;
  };

  return Array.from(transactionMap.values()).filter(addressFilter);
}

export function getCoins(coinMap: Map<string, ERC20Type>): ERC20Type[] {
  return Array.from(coinMap.values());
}

export function getNfts(nftMap: Map<string, ERC721Type>): ERC721Type[] {
  return Array.from(nftMap.values());
}

export interface EthAmount {
  eth: string;
  gwei: string;
  wei: string;

  ethFull: string;
  gweiFull: string;
  weiFull: string;

  display: string;
  full: string;
  big: BigNumber;
}

export interface BtcAmount {
  btc: string;
  sats: string;
}

export function formatZigAmount(amount: string): string {
  const count = amount.match(/\./g);
  let zigAmount = amount;
  if (count) {
    if (count.length > 1) {
      zigAmount = zigAmount.replaceAll('.', '');
    }
  }
  return utils.formatUnits(zigAmount, 'ether').slice(0, 6);
}

export function formatEthAmount(amount: string): EthAmount {
  const count = amount.match(/\./g);
  let ethAmount = amount;
  if (count) {
    if (count.length > 1) {
      ethAmount = ethAmount.replaceAll('.', '');
    }
  }
  const wei = utils.parseEther(ethAmount);
  return {
    eth: utils.formatUnits(wei, 'ether').slice(0, 6),
    gwei: utils.formatUnits(wei, 'gwei').slice(0, 6),
    wei: utils.formatUnits(wei, 'wei').slice(0, 6),
    ethFull: utils.formatUnits(wei, 'ether'),
    gweiFull: utils.formatUnits(wei, 'gwei'),
    weiFull: utils.formatUnits(wei, 'wei'),

    display: utils.formatUnits(wei, 'ether').slice(0, 6),
    full: utils.formatUnits(wei, 'ether'),
    big: wei,
  };
}

export function formatCoinAmount(balance: string | BigInt, decimals: number) {
  let amount = typeof balance === 'string' ? balance : balance.toString();
  if (amount.length < decimals) {
    const additionalDigits = '0'.repeat(decimals - amount.length + 1);
    amount = additionalDigits + amount;
  }
  const decimalPosition = amount.length - decimals;
  const includeDecimal = !amount
    .slice(decimalPosition)
    .split('')
    .every((char) => char === '0');
  const parts = [amount.slice(0, decimalPosition)];
  if (includeDecimal) {
    parts.push('.');
    parts.push(amount.slice(decimalPosition));
  }
  const adjustedAmount = parts.join('');

  return {
    big: BigInt(amount),
    full: adjustedAmount,
    display: adjustedAmount.slice(0, adjustedAmount[5] === '.' ? 8 : 7),
  };
}

export function convertEthAmountToUsd(
  amount: EthAmount,
  exchangeRate: number = 1647.37
) {
  if (amount.eth === '0') {
    return 0;
  }
  const usd = Number(amount.eth) * exchangeRate;
  return usd.toFixed(2);
}

export function formatBtcAmount(amount: string): BtcAmount {
  const count = amount.match(/\./g);
  let ethAmount = amount;
  if (count) {
    if (count.length > 1) {
      ethAmount = ethAmount.replaceAll('.', '');
    }
  }
  const wei = utils.parseEther(ethAmount);
  return {
    btc: utils.formatUnits(wei, 'ether').slice(0, 6),
    sats: 'placeholder',
  };
}

export function convertBtcAmountToUsd(
  amount: BtcAmount,
  exchangeRate: number = 1647.37
) {
  if (amount.btc === '0') {
    return 0;
  }
  const usd = Number(amount.btc) * exchangeRate;
  return usd.toFixed(2);
}

export function convertERC20AmountToUsd(
  amount: any,
  exchangeRate: number = 1647.37
) {
  if (amount.btc === '0') {
    return 0;
  }
  const usd = Number(amount.btc) * exchangeRate;
  return usd.toFixed(2);
}

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const fullMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
// https://coincodex.com/cryptocurrencies/sector/ethereum-erc20/
export function getMockCoinIcon(ticker: string) {
  switch (ticker) {
    case 'BUSD':
      return 'https://cryptologos.cc/logos/binance-usd-busd-logo.png';
    case 'MATIC':
      return 'https://cryptologos.cc/logos/polygon-matic-logo.png';
    case 'SHIB':
      return 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png';
    case 'DAI':
      return 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png';
    case 'WBTC':
      return 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png';
    case 'UNI':
      return 'https://cryptologos.cc/logos/uniswap-uni-logo.png';
    case 'LINK':
      return 'https://cryptologos.cc/logos/chainlink-link-logo.png';
    case 'LEO':
      return 'https://cryptologos.cc/logos/unus-sed-leo-leo-logo.png';
    case 'APE':
      return 'https://cryptologos.cc/logos/apecoin-ape-ape-logo.png';
    case 'CRO':
      return 'https://cryptologos.cc/logos/cronos-cro-logo.png';
    case 'QNT':
      return 'https://cryptologos.cc/logos/quant-qnt-logo.png';
    case 'MANA':
      return 'https://cryptologos.cc/logos/decentraland-mana-logo.png';
    case 'AAVE':
      return 'https://cryptologos.cc/logos/aave-aave-logo.png';
    case 'MKR':
      return 'https://cryptologos.cc/logos/maker-mkr-logo.png';
    case 'USDT':
      return 'https://cryptologos.cc/logos/tether-usdt-logo.png';
    case 'USDC':
      return 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';
    case 'XRP':
      return 'https://cryptologos.cc/logos/xrp-xrp-logo.png';
    case 'ADA':
      return 'https://cryptologos.cc/logos/cardano-ada-logo.png';
    case 'DOGE':
      return 'https://cryptologos.cc/logos/dogecoin-doge-logo.png';
    case 'SOL':
      return 'https://cryptologos.cc/logos/solana-sol-logo.png';
    case 'DOT':
      return 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png';
    case 'AVAX':
      return 'https://cryptologos.cc/logos/avalanche-avax-logo.png';
    case 'TRON':
      return 'https://cryptologos.cc/logos/tron-trx-logo.png';
    case 'BNB':
      return 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Binance-Coin-BNB-icon.png';
    case 'WETH':
      return 'https://s3.amazonaws.com/token-icons/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png';
    default:
      return 'https://static.thenounproject.com/png/3262833-200.png';
  }
}
