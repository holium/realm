import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';

import { Flex } from '@holium/design-system/general';

import { nativeApps } from 'renderer/apps/nativeApps';
import { Notes } from 'renderer/apps/Notes/Notes';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { useAppState } from 'renderer/stores/app.store';
import { AppType } from 'renderer/stores/models/bazaar.model';

import { AppWindowContainer } from './components/AppWindow/AppWindow.styles';

const AppWindowManagerPresenter = () => {
  const { shellStore, showTitleBar } = useAppState();
  const { getOptions, setOptions } = useContextMenu();
  const id = 'desktop-fill';

  const contextMenuOptions: ContextMenuOption[] = useMemo(
    () => [
      {
        label: 'Change wallpaper',
        icon: 'Palette',
        onClick: () => {
          shellStore.openWindow(nativeApps['os-settings'] as AppType, {
            route: 'theme',
          });
        },
      },
      // TODO leave in as a reminder to add this feature
      // {
      //   label: 'Show widgets',
      //   disabled: true,
      //   onClick: (evt: any) => {
      //     evt.stopPropagation();
      //   },
      // },
      {
        label: 'Toggle devtools',
        icon: 'DevBox',
        onClick: () => {
          shellStore.toggleDevTools();
        },
      },
    ],
    []
  );

  useEffect(() => {
    if (contextMenuOptions && contextMenuOptions !== getOptions(id)) {
      setOptions(id, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions]);

  return (
    <motion.div
      id={id}
      animate={{
        display: shellStore.isHomePaneOpen ? 'none' : 'block',
      }}
      style={{
        padding: '8px',
        paddingTop: 0,
        position: 'fixed',
        top: showTitleBar ? 40 : 0,
        height: `calc(100vh - 88px)`,
        left: 0,
        right: 0,
      }}
    >
      <AppWindowContainer
        style={{
          width: '90%',
          height: '90%',
        }}
      >
        <Flex width="100%" height="100%">
          <Notes />
        </Flex>
      </AppWindowContainer>
    </motion.div>
  );
};

export const AppWindowManager = observer(AppWindowManagerPresenter);
