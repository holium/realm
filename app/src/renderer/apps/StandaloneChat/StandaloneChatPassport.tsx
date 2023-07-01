import { observer } from 'mobx-react';

import { CheckBox } from '@holium/design-system';
import { Flex } from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { ChatLogHeader } from '../Courier/components/ChatLogHeader';
import { SettingControl } from '../System/components/SettingControl';
import { SettingPane } from '../System/components/SettingPane';
import { SettingSection } from '../System/components/SettingSection';
import { AccountPassportSection } from '../System/panels/sections/AccountPassportSection';

type Props = {
  onBack: () => void;
};

const StandaloneChatPassportPresenter = ({ onBack }: Props) => {
  const { loggedInAccount } = useAppState();
  const { settingsStore } = useShipStore();

  if (!loggedInAccount) return null;

  return (
    <Flex
      flexDirection="column"
      width="100%"
      height="100%"
      borderTop="1px solid var(--rlm--color)"
    >
      <ChatLogHeader
        path={loggedInAccount.serverId}
        isMuted={false}
        hasMenu={false}
        forceBackButton
        isStandaloneChat
        onBack={onBack}
      />
      <SettingPane>
        <AccountPassportSection
          account={loggedInAccount}
          key={`${loggedInAccount.serverId}-settings-passport`}
        />
        <SettingSection
          title="Background"
          body={
            <SettingControl label="Space Wallpaper">
              <CheckBox
                label="Use space wallpapers as the background for chat windows."
                isChecked={settingsStore.isolationModeEnabled}
                onChange={settingsStore.toggleIsolationMode}
              />
            </SettingControl>
          }
        />
      </SettingPane>
    </Flex>
  );
};

export const StandaloneChatPassport = observer(StandaloneChatPassportPresenter);
