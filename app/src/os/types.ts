export type MSTAction = {
  name: string;
  path: string;
  args: any[];
};
export type ShipInfoType = {
  url: string;
  cookie: string;
  theme?: any;
  wallpaper?: string;
  color?: string | null;
  nickname?: string;
  avatar?: string;
  loggedIn?: boolean;
};

export type PostType = {
  index: string;
  author: string;
  'time-sent': number;
  signatures: any[];
  contents: any[];
  hash: string;
};
