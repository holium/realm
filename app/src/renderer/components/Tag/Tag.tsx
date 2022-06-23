import { Flex, Icons, IconButton, IconTypes, Box } from '../';
import { TagStyle, TagIcon } from './Tag.styles';

export type IntentTypes = 'info' | 'success' | 'caution' | 'alert';

export type TagProps = {
  children: any;
  minimal?: boolean;
  custom?: string;
  intent: IntentTypes;
  icon?: IconTypes;
  rounded?: boolean;
  onRemove?: (evt: any) => any;
};

export const Tag: any = (props: TagProps) => {
  const { children, icon, intent, minimal, onRemove, rounded, custom } = props;
  return (
    <TagStyle
      intent={intent}
      minimal={minimal}
      custom={custom}
      rounded={rounded}
    >
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
};

Tag.defaultProps = {
  intent: 'info',
  minimal: false,
};
