import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';

import { ChatLogHeader } from '../Courier/components/ChatLogHeader';
import { AccountPassportSection } from '../System/panels/sections/AccountPassportSection';

type Props = {
  onBack: () => void;
};

const StandaloneChatPassportPresenter = ({ onBack }: Props) => {
  const { loggedInAccount } = useAppState();

  if (!loggedInAccount) return null;

  return (
    <Flex
      flexDirection="column"
      width="100%"
      height="100%"
      borderTop="1px solid var(--rlm--color)"
      background="var(--rlm-base-color)"
    >
      <ChatLogHeader
        path={loggedInAccount.serverId}
        rightAction={null}
        isMuted={false}
        hasMenu={false}
        forceBackButton
        isStandaloneChat
        onBack={onBack}
      />
      <Flex flex={1} width="100%" padding="12px">
        <AccountPassportSection
          account={loggedInAccount}
          key={`${loggedInAccount.serverId}-settings-passport`}
        />
      </Flex>
    </Flex>
  );
};

export const StandaloneChatPassport = observer(StandaloneChatPassportPresenter);
