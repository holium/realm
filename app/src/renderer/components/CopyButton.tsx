import { useState } from 'react';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { useServices } from 'renderer/logic/store';
import { Box, Icons } from '../components';

interface CopyProps {
  content: string;
  size?: number;
}

export function CopyButton(props: CopyProps) {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(props.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  };

  return (
    <Box>
      {!copied ? (
        <Box onClick={copy}>
          <Icons
            name="Copy"
            size={props.size || 2}
            color={baseTheme.colors.text.disabled}
          />
        </Box>
      ) : (
        <Icons
          name="CheckCircle"
          size={props.size || 2}
          color={baseTheme.colors.ui.intent.success}
        />
      )}
    </Box>
  );
}
