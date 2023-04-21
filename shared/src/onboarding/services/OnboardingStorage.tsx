import { Nullable, RealmOnboardingStep } from '../types';

type Storage = {
  step: RealmOnboardingStep;
  email: string;
  passwordHash: string;
  masterAccountId: number;
  token: string;
  clientSideEncryptionKey: string;
  /* Ship info */
  shipId: string;
  shipUrl: string;
  shipCode: string;
  shipType: 'hosted' | 'local';
  /* Passport info */
  nickname: string;
  description: string;
  avatar: string;
};

const storageKeys: (keyof Storage)[] = [
  'step',
  'email',
  'passwordHash',
  'masterAccountId',
  'token',
  'clientSideEncryptionKey',
  'shipId',
  'shipUrl',
  'shipCode',
  'shipType',
  'nickname',
  'description',
  'avatar',
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
      shipId: localStorage.getItem('shipId'),
      shipUrl: localStorage.getItem('shipUrl'),
      shipCode: localStorage.getItem('shipCode'),
      shipType:
        (localStorage.getItem('shipType') as 'hosted' | 'local') ?? 'local',
      nickname: localStorage.getItem('nickname'),
      description: localStorage.getItem('description'),
      avatar: localStorage.getItem('avatar'),
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
  },
};
