import { FC, useEffect } from 'react';
import { DragControls } from 'framer-motion';
import { Titlebar } from './Titlebar';
import { nativeApps } from 'renderer/apps/nativeApps';
import { BrowserToolbarProps } from 'renderer/apps/Browser/Toolbar/Toolbar';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import {
  DialogTitlebar,
  DialogTitlebarProps,
} from 'renderer/system/dialog/Dialog/DialogTitlebar';
import { AppType } from 'os/services/spaces/models/bazaar';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { ShellStoreType } from 'os/services/shell/shell.model';
import { ThemeType } from 'renderer/logic/theme';

type Props = {
  appWindow: AppWindowType;
  appInfo: AppType;
  shell: ShellStoreType;
  dragControls: DragControls;
  currentTheme: ThemeType;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onDevTools: () => void;
  onDragStart: () => void;
  onDragStop: () => void;
};

export const TitlebarByType = ({
  appWindow,
  appInfo,
  shell,
  dragControls,
  currentTheme,
  onDevTools,
  onDragStart,
  onDragStop,
  onClose,
  onMaximize,
  onMinimize,
}: Props) => {
  let hideTitlebarBorder = false;
  let noTitlebar = false;
  let CustomTitlebar: FC<BrowserToolbarProps> | FC<DialogTitlebarProps> | null;
  let showDevToolsToggle = true;
  let maximizeButton = true;
  if (appInfo?.type === 'urbit') {
    hideTitlebarBorder = !appInfo.config?.titlebarBorder || false;
  }

  let titlebar = (
    <Titlebar
      isAppWindow
      maximizeButton={maximizeButton}
      minimizeButton
      closeButton
      noTitlebar={noTitlebar}
      hasBorder={!hideTitlebarBorder}
      showDevToolsToggle={showDevToolsToggle}
      zIndex={appWindow.zIndex}
      dragControls={dragControls}
      onDevTools={onDevTools}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onClose={onClose}
      onMaximize={onMaximize}
      onMinimize={onMinimize}
      theme={currentTheme}
      appWindow={appWindow}
    />
  );

  if (appWindow.type === 'native') {
    hideTitlebarBorder =
      nativeApps[appWindow.appId].native!.hideTitlebarBorder!;
    noTitlebar = nativeApps[appWindow.appId].native!.noTitlebar!;
    // const CustomTitlebar =
    //   getNativeAppWindow[appWindow.appId as NativeAppId].titlebar;
    // TODO: Remove hardcoded showDevToolsToggle
    showDevToolsToggle = true;
    /*if (customTitlebar) {
      titlebar = (
        <CustomTitlebar
          zIndex={appWindow.zIndex}
          showDevToolsToggle
          dragControls={dragControls}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
        />
      );*/
    if (false) {
    } else {
      titlebar = (
        <Titlebar
          isAppWindow
          maximizeButton={maximizeButton}
          minimizeButton
          closeButton
          noTitlebar={noTitlebar}
          hasBorder={!hideTitlebarBorder}
          showDevToolsToggle={showDevToolsToggle}
          zIndex={appWindow.zIndex}
          dragControls={dragControls}
          onDevTools={onDevTools}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          theme={currentTheme}
          appWindow={appWindow}
        />
      );
    }
  }

  if (appWindow.type === 'dialog') {
    hideTitlebarBorder = true;
    const dialogRenderer = dialogRenderers[appWindow.appId];
    const dialogConfig: DialogConfig =
      dialogRenderer instanceof Function
        ? dialogRenderer(shell.dialogProps.toJSON())
        : dialogRenderer;
    noTitlebar = dialogConfig.noTitlebar!;
    const onCloseDialog = dialogConfig.hasCloseButton
      ? dialogConfig.onClose
      : undefined;
    const onOpenDialog = dialogConfig.onOpen;
    CustomTitlebar = DialogTitlebar as FC<DialogTitlebarProps>;
    showDevToolsToggle = false;
    maximizeButton = false;
    // console.log('dialogConfig', dialogConfig, onClose);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      // trigger onOpen only once
      onOpenDialog && onOpenDialog();
    }, [onOpenDialog]);
    if (noTitlebar) {
      titlebar = <div />;
    } else {
      titlebar = (
        <CustomTitlebar
          zIndex={appWindow.zIndex}
          showDevToolsToggle
          dragControls={dragControls}
          onClose={onCloseDialog}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
        />
      );
    }
  }

  return titlebar;
};
