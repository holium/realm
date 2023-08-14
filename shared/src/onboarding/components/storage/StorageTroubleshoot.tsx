import { useState } from 'react';

import { Button, Flex, Spinner, Text } from '@holium/design-system/general';

import { AccountDialogTableRow } from '../../components/AccountDialogTableRow';

type Props = {
  onClick: () => Promise<string> | undefined;
};

type DebugState = 'uninitialized' | 'restarting' | 'restarted';

export const StorageTroubleshoot = ({ onClick }: Props) => {
  const [debugState, setDebugState] = useState<DebugState>('uninitialized');

  const getDebugElement = () => {
    switch (debugState) {
      case 'uninitialized':
        return <Text.Body>Restart Storage</Text.Body>;
      case 'restarting':
        return <Spinner size={16} />;
      case 'restarted':
        return <Text.Body>Restarted</Text.Body>;
      default:
        return null;
    }
  };

  const handleOnClick = async () => {
    setDebugState('restarting');
    await onClick();
    setDebugState('restarted');
  };

  return (
    <AccountDialogTableRow title="Troubleshoot">
      <Flex flex={1} justifyContent="flex-end">
        <Button.Secondary
          type="button"
          width="124px"
          height="28px"
          alignItems="center"
          justifyContent="center"
          disabled={['restarting', 'restarted'].includes(debugState)}
          onClick={handleOnClick}
        >
          {getDebugElement()}
        </Button.Secondary>
      </Flex>
    </AccountDialogTableRow>
  );
};
