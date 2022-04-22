export const generateChannelId = () => {
  const channelId: string = [
    Date.now(),
    '',
    Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  ]
    .toString()
    .replaceAll(',', '');
  return channelId;
};
