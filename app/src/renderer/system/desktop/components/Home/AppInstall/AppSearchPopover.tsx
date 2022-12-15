import { useMemo } from 'react';
import { useServices } from 'renderer/logic/store';
import { darken } from 'polished';
import { useAppInstaller } from 'renderer/system/desktop/components/Home/AppInstall/store';
import { RealmPopover } from '../Popover';
import { SearchModes } from './SearchModes';

export const AppSearchPopover = () => {
  const appInstaller = useAppInstaller();
  const { theme } = useServices();
  const backgroundColor = useMemo(
    () =>
      theme.currentTheme.mode === 'light'
        ? theme.currentTheme.windowColor
        : darken(0.1, theme.currentTheme.windowColor),
    [theme.currentTheme]
  );

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
        background: backgroundColor,
      }}
    >
      <SearchModes />
    </RealmPopover>
  );
};
