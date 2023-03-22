import { useToggle } from '@holium/shared';
import { Flex } from '../../general/Flex/Flex';
import { Text } from '../../general/Text/Text';
import { Icon } from '../../general/Icon/Icon';

type Props = {
  label?: string;
  title?: string;
  isChecked?: boolean;
  disabled?: boolean;
  defaultChecked?: boolean;
  onClick?: () => void;
};

export const CheckBox = ({
  label,
  title,
  isChecked,
  disabled,
  defaultChecked,
  onClick,
}: Props) => {
  const toggled = useToggle(isChecked ?? defaultChecked ?? false);

  const onToggle = () => {
    if (disabled) return;
    toggled.toggle();
    onClick?.();
  };

  return (
    <Flex alignItems="center" gap={12}>
      <Flex
        onClick={onToggle}
        style={{
          opacity: disabled ? 0.7 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {toggled.isOn ? (
          <Icon name="CheckboxChecked" fill="accent" />
        ) : (
          <Icon name="CheckboxBlank" fill="text" />
        )}
      </Flex>

      <Flex flexDirection="column">
        {title && (
          <Text.Body
            display="flex"
            alignItems="center"
            color="text"
            fontWeight={600}
          >
            {title}
          </Text.Body>
        )}
        {label && (
          <Text.Label
            display="flex"
            alignItems="center"
            color="text"
            fontWeight={400}
          >
            {label}
          </Text.Label>
        )}
      </Flex>
    </Flex>
  );
};
