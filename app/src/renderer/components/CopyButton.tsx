import { Box, Icon, useToggle } from '@holium/design-system';

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
          <Icon name="Copy" size={size} fill="text" opacity={0.5} />
        </Box>
      ) : (
        <Icon name="CheckCircle" size={size} fill="intent-success" />
      )}
    </Box>
  );
};
