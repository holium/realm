/**
 * Converts "/identity/auth" => "identity.auth"
 *
 * @param path
 * @returns string
 */
export const cleanPath = (path: string): string => {
  return path.replaceAll('/', '.').substring(1);
};

export const fromPathString = (path: string, targetObject: any) => {
  const pathArr = path.split('.');
  for (var i = 0; i < pathArr.length; i++) {
    targetObject = targetObject[pathArr[i]]
      ? targetObject[pathArr[i]]
      : (targetObject[pathArr[i]] = {});
  }
  return targetObject;
};
