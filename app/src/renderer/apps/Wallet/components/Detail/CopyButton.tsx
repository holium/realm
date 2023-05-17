import { useState } from 'react';

import { Box, Icon } from '@holium/design-system/general';

type Props = { content: string };

export const CopyButton = ({ content }: Props) => {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  }

  return (
    <Box>
      {!copied ? (
        <Box onClick={copy}>
          <Icon name="Copy" height="20px" />
        </Box>
      ) : (
        <Icon name="CheckCircle" height="20px" />
      )}
    </Box>
  );
};
