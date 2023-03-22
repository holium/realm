import { Box, Icon } from '@holium/design-system';
import { useToggle } from '@holium/shared';

interface CopyButtonProps {
  content: string;
  size?: number;
}

export const CopyButton = ({ content, size = 2 }: CopyButtonProps) => {
  const copied = useToggle(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    copied.toggleOn();
    setTimeout(copied.toggleOff, 750);
  };

  return (
    <Box>
      {!copied.isOn ? (
        <Box onClick={copy}>
          <Icon name="Copy" size={size} color="text" opacity={0.5} />
        </Box>
      ) : (
        <Icon name="CheckCircle" size={size} color="intent-success" />
      )}
    </Box>
  );
};
