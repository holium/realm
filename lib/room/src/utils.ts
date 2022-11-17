export function isFireFox(): boolean {
  if (!isWeb()) return false;
  return navigator.userAgent.includes('Firefox');
}

export function isSafari(): boolean {
  if (!isWeb()) return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  if (!isWeb()) return false;
  return /Tablet|iPad|Mobile|Android|BlackBerry/.test(navigator.userAgent);
}

export function isWeb(): boolean {
  return typeof document !== 'undefined';
}

export async function sleep(duration: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, duration));
}
