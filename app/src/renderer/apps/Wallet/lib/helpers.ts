import { utils, BigNumber } from 'ethers';
import {
  ERC20Type,
  ERC721Type,
  TransactionType,
} from 'os/services/tray/wallet.model';
import { ThemeType } from 'renderer/logic/theme';
import { theme } from '../../../theme';

export function getBaseTheme(currentTheme: ThemeType) {
  // @ts-ignore
  return theme[currentTheme.mode];
}

export function shortened(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatWei(wei: string) {
  let amount = BigNumber.from(wei);
  return utils.formatEther(amount).slice(0, 7);
}

export function convertWeiToUsd(wei: string, exchangeRate: number = 1647.37) {
  let amount = BigNumber.from(wei);
  let eth = Number(utils.formatEther(amount));
  let usd = eth * exchangeRate;

  return usd.toFixed(2);
}

export function getTransactions(
  transactionMap: Map<string, TransactionType>,
  address?: string,
  coin?: ERC20Type | null
): TransactionType[] {
  let coinFilter = (transaction: TransactionType) => {
    // return coin ? transaction.coinName === coin!.name : true;
    // TODO: once we have hook to coin in transaction add this
    return coin ? false : true;
  };

  let addressFilter = (transaction: TransactionType) => {
    return address ? transaction.ourAddress === address : true;
  };

  return Array.from(transactionMap.values())
    .filter(addressFilter)
    .filter(coinFilter);
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

export function formatEthAmount(amount: string): EthAmount {
  const count = amount.match(/\./g);
  var ethAmount = amount;
  if (count) {
    if (count.length > 1) {
      ethAmount = ethAmount.replaceAll('.', '');
    }
  }
  let wei = utils.parseEther(ethAmount)!;
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
  let decimalPosition = amount.length - decimals;
  let includeDecimal = !amount
    .slice(decimalPosition)
    .split('')
    .every((char) => char === '0');
  let parts = [amount.slice(0, decimalPosition)];
  if (includeDecimal) {
    parts.push('.');
    parts.push(amount.slice(decimalPosition));
  }
  let adjustedAmount = parts.join('');

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
  let usd = Number(amount.eth) * exchangeRate;
  return usd.toFixed(2);
}

export function formatBtcAmount(amount: string): BtcAmount {
  return {
    btc: 'placeholder',
    sats: 'placeholder',
  };
}

export function convertBtcAmountToUsd(amount: BtcAmount) {
  return 'placeholder';
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

export function getMockCoinIcon(ticker: string) {
  switch (ticker) {
    case 'USDC':
      return 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png';
    case 'BNB':
      return 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Binance-Coin-BNB-icon.png';
    case 'SHIB':
      return 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png';
    case 'UNI':
      return 'https://cryptologos.cc/logos/uniswap-uni-logo.png';
    default:
      return 'https://static.thenounproject.com/png/3262833-200.png';
  }
}
