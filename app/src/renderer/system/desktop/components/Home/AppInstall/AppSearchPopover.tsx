import { observer } from 'mobx-react';

import { useAppState } from 'renderer/stores/app.store';
import { useAppInstaller } from 'renderer/system/desktop/components/Home/AppInstall/store';

import { RealmPopover } from '../Popover';
import { SearchModes } from './SearchModes';

const AppSearchPopoverPresenter = () => {
  const { showTitleBar } = useAppState();
  const appInstaller = useAppInstaller();

  const coords = {
    left: appInstaller.coords.left,
    top: showTitleBar ? appInstaller.coords.top + 16 : appInstaller.coords.top,
  };

  if (appInstaller.searchMode === 'none') return null;

  return (
    <RealmPopover
      id="app-install"
      isOpen
      coords={coords}
      dimensions={appInstaller.dimensions}
      onClose={() => appInstaller.setSearchMode('none')}
      style={{
        outline: 'none',
        boxShadow: '0px 0px 9px rgba(0, 0, 0, 0.12)',
        borderRadius: 12,
        maxHeight: '55vh',
        // overflowY: 'auto',
        background: 'rgba(var(--rlm-window-rgba))',
      }}
    >
      <SearchModes />
    </RealmPopover>
  );
};

export const AppSearchPopover = observer(AppSearchPopoverPresenter);
