import _ from 'lodash';
import f from 'lodash/fp';

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

// export const hexToUx = (hex: string): string => {
// if (hex.includes('#')) {
//   hex = hex.substring(1);
// }
//   const nonZeroChars = dropWhile(hex.split(''), (y) => y === '0');
//   const ux =
//     chunk(nonZeroChars.reverse(), 4)
//       .map((x) => {
//         return x.reverse().join('');
//       })
//       .reverse()
//       .join('.') || '0';

//   return `0x${ux}`;
// };
export const hexToUx = (hex: string) => {
  if (hex.includes('#')) {
    hex = hex.substring(1);
  }
  const ux = f.flow(
    f.reverse,
    f.chunk(4),
    // eslint-disable-next-line prefer-arrow-callback
    f.map((x) =>
      _.dropWhile(x, function (y: unknown) {
        return y === '0';
      })
        .reverse()
        .join('')
    ),
    f.reverse,
    f.join('.')
  )(hex.split(''));
  return `0x${ux}`;
};

export function normalizeUrbitColor(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }

  const colorString = color.slice(2).replace('.', '').toUpperCase();
  const lengthAdjustedColor = _.padEnd(colorString, 6, _.last(colorString));
  return `#${lengthAdjustedColor}`;
}
