import {
  Icons,
  Text,
  TextButton,
  Flex,
  IconTypes,
  Crest,
  isValidHexColor,
  isValidImageUrl,
} from 'renderer/components';
import { Row } from 'renderer/components/NewRow';

import { EmptyGroup } from '../SpaceRow';

interface ISelectRow {
  title: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: IconTypes;
  image?: string;
  color?: string;
  customBg?: string;
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
    customBg,
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
    leftIcon = <Icons size={32} name={icon!} />;
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
      gap={16}
      style={{ paddingLeft: 12 }}
      customBg={customBg}
      onClick={(evt: any) => {
        evt.stopPropagation();
        onClick && onClick(title);
      }}
    >
      {!hideIcon && leftIcon}
      <Flex flex={1} alignItems="center" justifyContent="space-between">
        <Flex flexDirection="column">
          <Text mb="2px" opacity={0.9} fontSize={3} fontWeight={500}>
            {title}
          </Text>
          {subtitle && (
            <Text opacity={0.5} fontSize={2} fontWeight={400}>
              {subtitle}
            </Text>
          )}
        </Flex>
        {onButtonClick && (
          <TextButton
            fontSize={2}
            onClick={(evt: any) => {
              evt.stopPropagation();
              onButtonClick(title);
            }}
          >
            {buttonText}
          </TextButton>
        )}
      </Flex>
    </Row>
  );
};
