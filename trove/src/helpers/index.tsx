import mime from 'mime';
import moment from 'moment';

export const isDev = () => false; // TODO: do I need a real isDev here?
export const log = (...args: any) => {
  //console log, only displays results in dev mode
  // if (!isDev()) return;
  console.log(...args);
};

export const splitLastOccurrence = (
  str: string,
  substring: string
): [string, string] => {
  const lastIndex = str.lastIndexOf(substring);

  const before = str.slice(0, lastIndex);

  const after = str.slice(lastIndex + 1);

  return [before, after];
};

export const humanFileSize = (bytes: any, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
};
export const getFileMetadata = (file: File) => {
  const fileParts = file.name.split('.');
  const fileName = fileParts.slice(0, -1);
  const fileExtension = fileParts.pop();
  const timeUnix = moment().unix();

  const metaData: any = {
    title: fileName[0],
    extension: fileExtension,
    timeUploaded: timeUnix,
    size: humanFileSize(file.size),
  };

  return metaData;
};
export const matchURLSafe = (string: string) => {
  //returns matches in a string to a urlsafe pattern
  const urlSafePattern = /^([a-z0-9._1~-]{1,})*$/g;
  const matches = string.match(urlSafePattern);

  return matches;
};
export const downloadURI = (
  filename: string,
  dataUrl: string,
  extension: string
) => {
  const type: any = mime.getType(extension);
  fetch(dataUrl, {
    method: 'GET',
    headers: {
      'Content-Type': type,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename + '.' + extension);

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    });
};
export const getCleanedPerms = (perms: any) => {
  //construct perms obj for api call

  const admins = perms.admin === 'readWrite' ? 'rw' : 'r';
  let member;
  if (perms.member === 'private') {
    member = null;
  } else if (perms.member === 'readWrite') {
    member = 'rw';
  } else {
    member = 'r';
  }
  const custom: any = {};
  perms.custom.forEach((item: any) => {
    custom[item.ship] = item.perm === 'readWrite' ? 'rw' : 'r';
  });
  const cleanedPerms = {
    admins,
    member,
    custom: custom,
  };
  return cleanedPerms;
};
export const isChildPath = (parentPath: string, childPath: string): boolean => {
  //given two paths we break them down to an array of the path parts.
  //compare them to determine if childPath is really child path
  //return true/false accordingly
  const parentPathParts = parentPath.split('/');
  parentPathParts.shift();

  const childPathParts = childPath.split('/');
  childPathParts.shift();
  //check if childPathParts length > parentPathParts length, if not return false (not a child path)
  if (parentPathParts.length > childPathParts.length) return false;
  for (let i = 0; i < parentPathParts.length; i++) {
    if (parentPathParts[i] !== childPathParts[i]) return false; //paths don't match up, not a child
  }
  return true; //passed the path tests and length test. is a child
};
export const imageExtensionList: string[] = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'svg',
  'webp',
];
export const isImage = (extension: string): boolean => {
  //determine wether the given extension is an image extension for the web
  return imageExtensionList.includes(extension.toLowerCase());
};

export const copyToClipboard = (text: string) => {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    // Use navigator clipboard API if available
    return navigator.clipboard.writeText(text);
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported('copy')
  ) {
    // Use document.execCommand('copy') fallback
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  } else {
    console.error('Clipboard access not supported');
    return false;
  }
};
export const isValidUrl = (urlString: string): boolean => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};
