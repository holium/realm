function dropWhile<T>(arr: T[], pred: (x: T) => boolean): T[] {
  const newArray = arr.slice();

  for (const item of arr) {
    if (pred(item)) {
      newArray.shift();
    } else {
      return newArray;
    }
  }

  return newArray;
}

function chunk<T>(arr: T[], size: number): T[][] {
  let chunk: T[] = [];
  let newArray = [chunk];

  for (let i = 0; i < arr.length; i++) {
    if (chunk.length < size) {
      chunk.push(arr[i]);
    } else {
      chunk = [arr[i]];
      newArray.push(chunk);
    }
  }

  return newArray;
}

export function uxToHex(ux: string) {
  if (ux.length > 2 && ux.substring(0, 2) === '0x') {
    const value = ux.substring(2).replace('.', '').padStart(6, '0');
    return value;
  }

  const value = ux.replace('.', '').padStart(6, '0');
  return value;
}

export const hexToUx = (hex: string): string => {
  if (hex.includes('#')) {
    hex = hex.substring(1);
  }
  const nonZeroChars = dropWhile(hex.split(''), (y) => y === '0');
  const ux =
    chunk(nonZeroChars.reverse(), 4)
      .map((x) => {
        return x.reverse().join('');
      })
      .reverse()
      .join('.') || '0';

  return `0x${ux}`;
};
