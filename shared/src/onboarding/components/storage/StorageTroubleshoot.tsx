import { useState } from 'react';

import { Flex, Spinner } from '@holium/design-system/general';

import { GrayButton } from '../ChangeButton';

type Props = {
  onClick: () => Promise<void>;
};

type DebugState = 'uninitialized' | 'restarting' | 'restarted';

export const StorageTroubleshoot = ({ onClick }: Props) => {
  const [debugState, setDebugState] = useState<DebugState>('uninitialized');

  const getDebugElement = () => {
    switch (debugState) {
      case 'uninitialized':
        return 'Set Credentials to Default';
      case 'restarting':
        return <Spinner size={16} />;
      case 'restarted':
        return 'Restarted';
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
    <Flex flex={1} justifyContent="flex-end">
      <GrayButton
        type="button"
        width="195px"
        alignItems="center"
        justifyContent="center"
        disabled={['restarting', 'restarted'].includes(debugState)}
        onClick={handleOnClick}
      >
        {getDebugElement()}
      </GrayButton>
    </Flex>
  );
};
