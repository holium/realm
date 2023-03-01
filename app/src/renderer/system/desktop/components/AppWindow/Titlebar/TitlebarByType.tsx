import { FC, useEffect, PointerEvent } from 'react';
import { Titlebar } from './Titlebar';
import { nativeApps } from 'renderer/apps/nativeApps';
import { BrowserToolbarProps } from 'renderer/apps/Browser/Toolbar/BrowserToolbar';
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
  currentTheme: ThemeType;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onDevTools: () => void;
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
};

export const TitlebarByType = ({
  appWindow,
  appInfo,
  shell,
  currentTheme,
  onDevTools,
  onDragStart,
  onDragEnd,
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
      onDevTools={onDevTools}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
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
          onDragStart={onDragStart as any}
          onDragEnd={onDragEnd}
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
          onDevTools={onDevTools}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
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
          onClose={onCloseDialog}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      );
    }
  }

  return titlebar;
};
