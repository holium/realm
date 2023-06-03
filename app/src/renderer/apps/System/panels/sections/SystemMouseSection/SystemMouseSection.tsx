import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';

import { SystemMouseSectionView } from './SystemMouseSectionView';

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
    <SystemMouseSectionView
      realmCursorEnabled={realmCursorEnabled}
      setRealmCursor={setRealmCursor}
      profileColorForCursorEnabled={profileColorForCursorEnabled}
      setProfileColorForCursor={setProfileColorForCursor}
      customFill={
        profileColorForCursorEnabled
          ? authStore.session?.color ?? undefined
          : undefined
      }
    />
  );
};

export const SystemMouseSection = observer(SystemMouseSectionPresenter);
