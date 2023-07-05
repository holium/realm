import { Flex } from '../../general/Flex/Flex';
import { Icon } from '../../general/Icon/Icon';
import { Text } from '../../general/Text/Text';
import { useToggle } from '../../util/hooks';

type Props = {
  label?: string;
  title?: string;
  isChecked?: boolean;
  disabled?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  size?: number;
};

export const CheckBox = ({
  label,
  title,
  isChecked,
  disabled,
  defaultChecked,
  onChange,
  size,
}: Props) => {
  const toggled = useToggle(isChecked ?? defaultChecked ?? false);

  const onToggle = () => {
    if (disabled) return;

    if (toggled.isOn) {
      toggled.toggleOff();
      onChange?.(false);
    } else {
      toggled.toggleOn();
      onChange?.(true);
    }
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
          <Icon
            name="CheckboxChecked"
            fill="accent"
            size={size ? size : undefined}
          />
        ) : (
          <Icon
            name="CheckboxBlank"
            fill="text"
            size={size ? size : undefined}
          />
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
