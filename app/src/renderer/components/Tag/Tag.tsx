import { Flex, Icons, IconButton, IconTypes } from '../';
import { TagStyle, TagIcon } from './Tag.styles';

export type IntentTypes = 'info' | 'success' | 'caution' | 'alert';

export interface TagProps {
  children: any;
  minimal?: boolean;
  custom?: string;
  intent: IntentTypes;
  icon?: IconTypes;
  rounded?: boolean;
  onRemove?: (evt: any) => any;
}

export const Tag = ({
  children,
  icon,
  intent = 'info',
  minimal = false,
  onRemove,
  rounded,
  custom,
}: TagProps) => (
  <TagStyle intent={intent} minimal={minimal} custom={custom} rounded={rounded}>
    {icon && (
      <TagIcon intent={intent}>
        <Icons size={18} name={icon} />
      </TagIcon>
    )}
    <Flex alignItems="center" ml={1}>
      {children}
    </Flex>
    {onRemove && (
      <IconButton size={18} ml={2} onClick={onRemove}>
        <Icons name="Close" />
      </IconButton>
    )}
  </TagStyle>
);
