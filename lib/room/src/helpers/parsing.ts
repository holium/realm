export const providerFromRid = (rid: string) => {
  return rid.split('/')[0];
};
