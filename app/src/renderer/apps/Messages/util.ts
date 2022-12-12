export function messageIndexGen(): [BigInt, number] {
  const DA_UNIX_EPOCH = 170141184475152167957503069145530368000n;
  const DA_SECOND = 18446744073709551616n;
  const timeSent = Date.now();
  const timeSinceEpoch = (BigInt(timeSent) * DA_SECOND) / BigInt(1000);

  const tsFin = DA_UNIX_EPOCH + timeSinceEpoch;
  const index = tsFin;

  return [index, timeSent];
}
