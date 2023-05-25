import { RadioOption } from '@holium/design-system/inputs';
import { ThemeType } from '@holium/shared';

export type CrestOptionType = 'color' | 'image';

export type AccessOptionType = 'public' | 'antechamber' | 'private';

export type SpaceWorkFlowState = {
  path: string;
  name: string;
  description: string;
  type: string;
  color: string;
  picture: string;
  crestOption: CrestOptionType;
  access: AccessOptionType;
  theme: ThemeType;
  archetype?: string;
  archetypeTitle?: string;
  loading?: boolean;
};

export const spaceColorOptions = [
  '#D9682A',
  '#D9A839',
  '#52B278',
  '#3E89D1',
  '#96A0A8',
  '#CC314C',
  '#CF8194',
  '#8419D9',
];

export const accessOptions: RadioOption[] = [
  {
    icon: 'Public',
    label: 'Public',
    value: 'public',
    sublabel: 'Anyone can join.',
  },
  {
    icon: 'EyeOff',
    label: 'Private',
    value: 'private',
    sublabel: 'An invitation is required to join.',
  },
  {
    icon: 'DoorOpen',
    label: 'Antechamber',
    value: 'antechamber',
    sublabel: 'Anyone can join a public holding area.',
    disabled: true,
  },
];
