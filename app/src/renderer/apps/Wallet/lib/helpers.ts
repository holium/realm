import {utils, BigNumber} from 'ethers';
import { DesktopStoreType } from 'os/services/shell/desktop.model';
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
