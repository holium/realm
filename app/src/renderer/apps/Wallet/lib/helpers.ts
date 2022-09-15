import {utils, BigNumber} from 'ethers';
import { DesktopStoreType } from 'os/services/shell/desktop.model';
import { NetworkType, TransactionType } from 'os/services/tray/wallet.model';
import { theme } from 'renderer/theme';

export function getBaseTheme(desktop: DesktopStoreType) {
  return theme[desktop.theme.mode === 'light' ? 'light' : 'dark'];
}

export function shortened(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function formatWei(wei: string) {
  let amount = BigNumber.from(wei);
  return utils.formatEther(amount).slice(0, 7);
}

export function convertWeiToUsd(wei: string) {
  let exchangeRate = 1647.37;

  let amount = BigNumber.from(wei);
  let eth = Number(utils.formatEther(amount));
  let usd = eth * exchangeRate;

  return usd.toFixed(2);
}

export function getTransactions(transactionMap: Map<string, TransactionType>, address?: string): TransactionType[] {
  return Array.from(transactionMap.values()).filter(trans => address ? trans.ourAddress === address : true);
}

export interface EthAmount {
  eth: string
  gwei: string
  wei: string

  ethFull: string
  gweiFull: string
  weiFull: string
}

export interface BtcAmount {
  btc: string
  sats: string
}

export function formatEthAmount(amount: string): EthAmount {
  let wei = utils.parseEther(amount);
  return {
    eth: utils.formatUnits(wei, 'ether').slice(0, 6),
    gwei: utils.formatUnits(wei, 'gwei').slice(0, 6),
    wei: utils.formatUnits(wei, 'wei').slice(0, 6),
    ethFull: utils.formatUnits(wei, 'ether'),
    gweiFull: utils.formatUnits(wei, 'gwei'),
    weiFull: utils.formatUnits(wei, 'wei')
  };
}

export function convertEthAmountToUsd(amount: EthAmount) {
  let exchangeRate = 1647.37;
  let usd = Number(amount.eth) * exchangeRate;
  return usd.toFixed(2);
}

export function formatBtcAmount(amount: string): BtcAmount {
  return {
    btc: 'placeholder',
    sats: 'placeholder'
  }
}

export function convertBtcAmountToUsd(amount: BtcAmount) {
  return 'placeholder'
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
  'Dec'
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
  'December'
];
