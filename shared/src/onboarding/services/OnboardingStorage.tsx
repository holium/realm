import { Nullable, RealmOnboardingStep } from '../types';

type Storage = {
  step: RealmOnboardingStep;
  email: string;
  passwordHash: string;
  masterAccountId: number;
  token: string;
  clientSideEncryptionKey: string;
  /* Ship info */
  serverId: string;
  serverUrl: string;
  serverCode: string;
  serverType: 'hosted' | 'local';
  /* Passport info */
  nickname: string;
  description: string;
  avatar: string;
  lastAccountLogin: string;
};

const storageKeys: (keyof Storage)[] = [
  'step',
  'email',
  'passwordHash',
  'masterAccountId',
  'token',
  'clientSideEncryptionKey',
  'serverId',
  'serverUrl',
  'serverCode',
  'serverType',
  'nickname',
  'description',
  'avatar',
  'lastAccountLogin', // Used to preselect the account on the login screen.
];

export const OnboardingStorage = {
  get: (): Nullable<Storage> => {
    return {
      step: localStorage.getItem('step') as RealmOnboardingStep | null,
      email: localStorage.getItem('email'),
      passwordHash: localStorage.getItem('passwordHash'),
      masterAccountId: Number(localStorage.getItem('masterAccountId')),
      token: localStorage.getItem('token'),
      clientSideEncryptionKey: localStorage.getItem('clientSideEncryptionKey'),
      serverId: localStorage.getItem('serverId'),
      serverUrl: localStorage.getItem('serverUrl'),
      serverCode: localStorage.getItem('serverCode'),
      serverType:
        (localStorage.getItem('serverType') as 'hosted' | 'local') ?? 'local',
      nickname: localStorage.getItem('nickname'),
      description: localStorage.getItem('description'),
      avatar: localStorage.getItem('avatar'),
      lastAccountLogin: localStorage.getItem('lastAccountLogin'),
    };
  },
  set: (storage: Partial<Storage>) => {
    storageKeys.forEach((key) => {
      const value = storage[key];
      if (value) localStorage.setItem(key, value.toString());
    });
  },
  reset: () => {
    localStorage.removeItem('step');
    localStorage.removeItem('nickname');
    localStorage.removeItem('description');
    localStorage.removeItem('avatar');
  },
  remove(key: keyof Storage) {
    localStorage.removeItem(key);
  },
};
