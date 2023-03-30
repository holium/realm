import { RadioOption } from '../RadioGroup/RadioGroup';
import { Row } from '../../general/Row/Row';
import { Flex } from '../../general/Flex/Flex';
import { Icon } from '../../general/Icon/Icon';
import { Text } from '../../general/Text/Text';

type Props = {
  options: RadioOption[];
  selected?: string;
  onClick: (value: any) => void;
};

export const RadioList = ({ options, selected, onClick }: Props) => (
  <Flex flexDirection="column" gap={8}>
    {options?.map((option) => {
      const isSelected = option.value === selected;
      return (
        <Row
          style={{ opacity: option.disabled ? 0.3 : 1 }}
          key={option.value}
          gap="12px"
          selected={isSelected}
          onClick={() => !option.disabled && onClick(option.value)}
        >
          {option.icon && (
            <Flex alignItems="center" justifyContent="center">
              <Icon
                opacity={isSelected ? 1 : 0.6}
                size={24}
                name={option.icon}
                fill={isSelected ? 'accent' : 'text'}
              />
            </Flex>
          )}
          <Flex flexDirection="column" textAlign="left">
            <Text.Custom
              fontSize={2}
              fontWeight={500}
              color={isSelected ? 'accent' : 'text'}
            >
              {option.label}
            </Text.Custom>
            {option.sublabel && (
              <Text.Custom
                fontSize={2}
                color="text"
                opacity={isSelected ? 0.4 : 0.6}
              >
                {option.sublabel}
              </Text.Custom>
            )}
          </Flex>
        </Row>
      );
    })}
  </Flex>
);
