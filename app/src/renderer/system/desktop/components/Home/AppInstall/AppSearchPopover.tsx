import { observer } from 'mobx-react';
import { useAppInstaller } from 'renderer/system/desktop/components/Home/AppInstall/store';
import { RealmPopover } from '../Popover';
import { SearchModes } from './SearchModes';

const AppSearchPopoverPresenter = () => {
  const appInstaller = useAppInstaller();
  if (appInstaller.searchMode === 'none') return null;

  return (
    <RealmPopover
      id="app-install"
      isOpen
      coords={appInstaller.coords}
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
