import { renderToString } from 'react-dom/server';
import { CheckBoxInput } from './CheckBox.styles';
import { Flex } from '../../general/Flex/Flex';
import { Text } from '../../general/Text/Text';
import { Icon } from '../../general/Icon/Icon';

type Props = {
  label?: string;
  title?: string;
  isChecked?: boolean;
  disabled?: boolean;
  defaultChecked?: boolean;
  onChange?: () => void;
};

export const CheckBox = ({
  label,
  title,
  isChecked,
  disabled,
  defaultChecked,
  onChange,
}: Props) => {
  const blankSvgJsxElement = <Icon name="CheckboxBlank" color="text" />;
  const checkedSvgJsxElement = <Icon name="CheckboxChecked" color="accent" />;
  const blankSvgString = renderToString(blankSvgJsxElement);
  const checkedSvgString = renderToString(checkedSvgJsxElement);

  return (
    <Flex alignItems="center" gap={12}>
      <CheckBoxInput
        type="checkbox"
        checked={isChecked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        blankSvgString={blankSvgString}
        checkedSvgString={checkedSvgString}
        onChange={onChange}
      />
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
          <Text.Label display="flex" alignItems="center" color="text">
            {label}
          </Text.Label>
        )}
      </Flex>
    </Flex>
  );
};
