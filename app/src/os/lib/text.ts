export const spaceToSnake = (text: string) => {
  return text.replaceAll(' ', '-').toLowerCase();
};
export const humanFriendlySpaceNameSlug = (fullName: string) => {
  return fullName
    .replaceAll(/ /g, '-') // first get all the spaces switched to hyphens
    .replaceAll(/[^a-zA-Z0-9\-]/g, '') // then all non-alphanumeric and '-' characters get removed
    .replace(/^-/, '') // then any leading hyphen goes away
    .replace(/-$/, '') // any trailing hypen goes away
    .toLowerCase(); // all lower case
};
