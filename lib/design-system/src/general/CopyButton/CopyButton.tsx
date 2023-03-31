import styled from 'styled-components';
import { Icon } from '../Icon/Icon';
import { Flex } from '../Flex/Flex';
import { Text } from '../Text/Text';
import { useToggle } from '../../util/hooks';

const CopyLabel = styled(Text.Body)`
  font-size: 14px;
  font-weight: 400;
  color: rgba(var(--rlm-text-rgba));
  opacity: 0.5;
  user-select: none;
`;

interface CopyButtonProps {
  content: string;
  label?: string;
  size?: number;
}

export const CopyButton = ({ content, label, size = 20 }: CopyButtonProps) => {
  const copied = useToggle(false);

  const copy = () => {
    if (copied.isOn) return;
    copied.toggleOn();
    navigator.clipboard.writeText(content);
    setTimeout(copied.toggleOff, 750);
  };

  return (
    <Flex
      gap={4}
      alignItems="center"
      style={{ cursor: 'pointer' }}
      onClick={copy}
    >
      {!copied.isOn ? (
        <Icon name="Copy" size={size} fill="text" opacity={0.5} />
      ) : (
        <Icon name="CheckCircle" size={size} fill="intent-success" />
      )}
      {label && <CopyLabel>{copied.isOn ? 'Copied!' : label}</CopyLabel>}
    </Flex>
  );
};
