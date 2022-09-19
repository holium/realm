import { utils, BigNumber } from 'ethers';
import { DesktopStoreType } from 'os/services/shell/desktop.model';
import { ThemeType } from 'renderer/logic/theme';
import { theme } from '../../../theme';

export function getBaseTheme(currentTheme: ThemeType) {
  // console.log(theme, currentTheme.mode);
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
  'Dec',
];
