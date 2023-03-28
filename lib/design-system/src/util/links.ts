const SPOTIFY_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:open\.)?(?:spotify\.com\/)(album|track|artist|playlist)\/(\w+)/;

const MUSIC_LINKS = {
  SPOTIFY: SPOTIFY_REGEX,
  YOUTUBE: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/)(watch\?v=)(\w+)/,
  SOUNDCLOUD: /(?:https?:\/\/)?(?:www\.)?(?:soundcloud\.com\/)(\w+)\/(\w+)/,
  APPLE_MUSIC:
    /(?:https?:\/\/)?(?:www\.)?(?:music\.apple\.com\/)(album|track|artist|playlist)\/(\w+)/,
  DEEZER:
    /(?:https?:\/\/)?(?:www\.)?(?:deezer\.com\/)(album|track|artist|playlist)\/(\w+)/,
  TIDAL:
    /(?:https?:\/\/)?(?:www\.)?(?:tidal\.com\/)(album|track|artist|playlist)\/(\w+)/,
  AMAZON_MUSIC:
    /(?:https?:\/\/)?(?:www\.)?(?:music\.amazon\.com\/)(album|track|artist|playlist)\/(\w+)/,
  GOOGLE_PLAY_MUSIC:
    /(?:https?:\/\/)?(?:www\.)?(?:play\.google\.com\/)(music\/m\/)(\w+)/,
  PANDORA:
    /(?:https?:\/\/)?(?:www\.)?(?:pandora\.com\/)(artist|album|song)\/(\w+)/,
};

const TWITTER_REGEX = [
  /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com\/)(\w+)\/status\/(\w+)/,
];

const YOUTUBE_REGEX = [
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/)(watch\?v=)(\w+)/,
  /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/)(\w+)/,
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/)(embed\/)(\w+)/,
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/)(v\/)(\w+)/,
];

const VIDEO_REGEX = [
  ...YOUTUBE_REGEX,
  /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\w+)/,
  /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com\/)(video\/)(\w+)/,
];

const MEDIA_TYPE = {
  IMAGE: /(\.jpg|\.jpeg|\.png|\.gif|\.svg|\.avif)$/,
  VIDEO: /(\.mp4|\.webm|\.ogg|\.ogv|\.avi|\.mov|\.wmv|\.flv|\.mpg|\.mpeg)$/,
  AUDIO: /(\.mp3|\.wav|\.ogg|\.oga|\.flac|\.aac|\.m4a)$/,
  DOCUMENT: /(\.pdf|\.doc|\.docx|\.xls|\.xlsx|\.ppt|\.pptx)$/,
  LINK: /((http|https|ftp):\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/,
};

type MediaTypes = 'image' | 'video' | 'audio' | 'document' | 'link';
type LinkTypes = 'twitter' | 'media' | 'link' | 'image';

export const isImageLink = (link: string) => {
  return link.match(MEDIA_TYPE.IMAGE);
};

export const isMusicLink = (link: string) => {
  return Object.values(MUSIC_LINKS).some((regex) => link.match(regex));
};

export const isMediaBlock = (link: string) => {
  return (
    VIDEO_REGEX.some((regex) => link.match(regex)) ||
    isMusicLink(link) ||
    link.match(MEDIA_TYPE.VIDEO)
  );
};

export const isTwitterLink = (link: string) => {
  return TWITTER_REGEX.some((regex) => link.match(regex));
};

export const isSpotifyLink = (link: string) => {
  return link.match(SPOTIFY_REGEX);
};

export const parseMediaType = (url: string) => {
  let mediaType: MediaTypes = 'link';
  let linkType: LinkTypes = 'link';

  if (url.match(MEDIA_TYPE.LINK)) {
    mediaType = 'link';
    if (isTwitterLink(url)) {
      linkType = 'twitter';
    }
    if (isMediaBlock(url)) {
      linkType = 'media';
    }
    if (isImageLink(url)) {
      linkType = 'image';
    }
  }
  return { mediaType, linkType };
};
