import { Icons, Text, TextButton, Flex, IconTypes } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';

import { EmptyGroup } from '../SpaceRow';

interface ISelectRow {
  title: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: IconTypes;
  image?: string;
  customBg?: string;
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
    title,
    buttonText,
    subtitle,
    onClick,
    onButtonClick,
  } = props;
  let leftIcon = <EmptyGroup />;
  if (icon) {
    leftIcon = <Icons size={32} name={icon!} />;
  }
  if (image) {
    leftIcon = (
      <img height={32} width={32} style={{ borderRadius: 4 }} src={image!} />
    );
  }
  return (
    <Row
      selected={selected}
      disabled={disabled}
      gap={16}
      customBg={customBg}
      onClick={(evt: any) => {
        evt.stopPropagation();
        onClick && onClick(title);
      }}
    >
      {leftIcon}
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
