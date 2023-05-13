export function cleanNounColor(ux: string) {
  if (ux === '') {
    return '#000';
  }
  if (ux.startsWith('#')) {
    return ux;
  }
  if (ux.length > 2 && ux.substring(0, 2) === '0x') {
    const value = ux.substring(2).replace('.', '').padStart(6, '0');
    return `#${value}`;
  }

  const value = ux.replace('.', '').padStart(6, '0');
  return `#${value}`;
}

export const removeHash = (hex: string) => {
  if (hex.includes('#')) {
    hex = hex.substring(1);
  }
  return hex;
};
