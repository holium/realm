import {
  Row,
  Button,
  Text,
  IconPathsType,
  Icon,
  Flex,
} from '@holium/design-system';
import { Crest, isValidHexColor, isValidImageUrl } from 'renderer/components';

import { EmptyGroup } from '../SpaceRow';

interface ISelectRow {
  title: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: IconPathsType;
  image?: string;
  color?: string;
  hideIcon?: boolean;
  buttonText?: string;
  subtitle?: string;
  onClick?: (data: any) => void;
  onButtonClick?: (data: any) => void;
}

export const SelectRow = (props: ISelectRow) => {
  const {
    selected,
    disabled,
    icon,
    image,
    color,
    title,
    buttonText,
    subtitle,
    hideIcon,
    onClick,
    onButtonClick,
  } = props;
  let leftIcon = <EmptyGroup />;
  if (icon) {
    leftIcon = <Icon size={32} name={icon} />;
  }
  if (image || color) {
    const validatedColor = color && isValidHexColor(color) ? color : '';
    const validatedImageUrl = image && isValidImageUrl(image) ? image : '';
    leftIcon = (
      <Crest color={validatedColor} picture={validatedImageUrl} size="sm" />
    );
  }

  return (
    <Row
      selected={selected}
      disabled={disabled}
      style={{ paddingLeft: 12, gap: 16 }}
      onClick={(evt: any) => {
        evt.stopPropagation();
        onClick && onClick(title);
      }}
    >
      {!hideIcon && leftIcon}
      <Flex flex={1} alignItems="center" justifyContent="space-between">
        <Flex flexDirection="column">
          <Text.Custom mb="2px" opacity={0.9} fontSize={3} fontWeight={500}>
            {title}
          </Text.Custom>
          {subtitle && (
            <Text.Custom opacity={0.5} fontSize={2} fontWeight={400}>
              {subtitle}
            </Text.Custom>
          )}
        </Flex>
        {onButtonClick && (
          <Button.TextButton
            fontSize={2}
            onClick={(evt: any) => {
              evt.stopPropagation();
              onButtonClick(title);
            }}
          >
            {buttonText}
          </Button.TextButton>
        )}
      </Flex>
    </Row>
  );
};
