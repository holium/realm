import { Flex } from '../../general/Flex/Flex';
import { Icon } from '../../general/Icon/Icon';
import { IconPathsType } from '../../general/Icon/icons';
import {
  RadioHighlight,
  RadioLabel,
  RadioLabelContainer,
} from './RadioGroup.style';

export type RadioOption = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: IconPathsType;
  disabled?: boolean;
  hidden?: boolean;
  highlightColor?: string;
};

type Props = {
  options: RadioOption[];
  selected?: string;
  onClick: (value: string) => void;
};

export const RadioGroup = ({ options, selected, onClick }: Props) => (
  <Flex
    p={1}
    flexDirection="row"
    width="fit-content"
    justifyContent="flex-start"
    gap={4}
    borderRadius={6}
    bg="window"
    style={{ backdropFilter: 'brightness(0.975)' }}
  >
    {options.map((option) => {
      const isSelected = option.value === selected;
      return (
        <RadioLabelContainer
          key={option.value}
          hasIcon={Boolean(option.icon)}
          onClick={() => onClick(option.value)}
        >
          {isSelected && <RadioHighlight isSelected />}
          {option.icon && (
            <Icon mr="6px" name={option.icon} pointerEvents="none" />
          )}
          <RadioLabel isSelected={isSelected}>{option.label}</RadioLabel>
        </RadioLabelContainer>
      );
    })}
  </Flex>
);
