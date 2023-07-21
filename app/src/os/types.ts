export type Patp = string;

// sur/membership.hoon
export type MemberRole = 'initiate' | 'member' | 'admin' | 'owner';
export type MemberStatus = 'invited' | 'joined' | 'host';

export type MediaAccessStatus =
  | 'not-determined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'unknown';

export type MediaAccess = {
  camera: MediaAccessStatus;
  mic: MediaAccessStatus;
  screen: MediaAccessStatus;
};

type JSONValue = string | number | boolean | JSONObject | JSONArray;
type JSONArray = Array<JSONValue>;
export type JSONObject = {
  [x: string]: JSONValue;
};

type KeyPair = [name: string, t: string];
export type BedrockSchema = KeyPair[];

type BedrockRow = {
  id: string;
  data: any;
  creator: string;
  path: string;
  type: string;
  'created-at': number;
  'updated-at': number;
  'received-at': number;
  v: number;
};

export type BedrockTable = {
  type: string;
  rows: BedrockRow[];
};

export type BedrockResponse = {
  dels: JSONObject;
  'path-row': JSONObject;
  peers: JSONObject;
  tables: BedrockTable[];
  schemas: JSONObject;
};

export type BedrockSubscriptionUpdate = {
  change: string;
  /* Create/Update events */
  row?: BedrockRow;
  /* Delete events */
  id?: string;
  timestamp?: number;
  path?: string;
  type?: string;
};
