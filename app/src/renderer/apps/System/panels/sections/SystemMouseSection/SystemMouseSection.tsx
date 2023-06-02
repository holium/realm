import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';
import { CheckBox } from '@holium/design-system/inputs';

import { useAppState } from 'renderer/stores/app.store';

import { SettingControl } from '../../../components/SettingControl';
import { SettingSection } from '../../../components/SettingSection';
import { CursorOption } from './CursorOption';

type Props = {
  realmCursorEnabled: boolean;
  setRealmCursor: (enabled: boolean) => void;
  profileColorForCursorEnabled: boolean;
  setProfileColorForCursor: (enabled: boolean) => void;
};

const SystemMouseSectionPresenter = ({
  realmCursorEnabled,
  setRealmCursor,
  profileColorForCursorEnabled,
  setProfileColorForCursor,
}: Props) => {
  const { authStore } = useAppState();

  return (
    <SettingSection
      title="Mouse"
      body={
        <SettingControl label="Cursor type">
          <Flex flexDirection="column" gap="16px">
            <Flex gap="12px">
              <CursorOption
                type="System"
                isSelected={!realmCursorEnabled}
                onClick={() => {
                  if (realmCursorEnabled) setRealmCursor(false);
                }}
              />
              <CursorOption
                type="Realm"
                isSelected={realmCursorEnabled}
                customFill={
                  profileColorForCursorEnabled
                    ? authStore.session?.color ?? undefined
                    : undefined
                }
                onClick={() => {
                  if (!realmCursorEnabled) setRealmCursor(true);
                }}
              />
            </Flex>
            {realmCursorEnabled && (
              <CheckBox
                label="Use profile color for cursor"
                isChecked={profileColorForCursorEnabled}
                onChange={setProfileColorForCursor}
              />
            )}
          </Flex>
        </SettingControl>
      }
    />
  );
};

export const SystemMouseSection = observer(SystemMouseSectionPresenter);
