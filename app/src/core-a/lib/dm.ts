import bigInt, { BigInteger } from 'big-integer';

const DA_UNIX_EPOCH = bigInt('170141184475152167957503069145530368000'); // `@ud` ~1970.1.1

const DA_SECOND = bigInt('18446744073709551616'); // `@ud` ~s1

export function unixToDa(unix: number): BigInteger {
  const timeSinceEpoch = bigInt(unix).multiply(DA_SECOND).divide(bigInt(1000));
  return DA_UNIX_EPOCH.add(timeSinceEpoch);
}
// export const createPostNode = () => {
//   return {
//     post: postData,
//     children: null,
//   };
// };
