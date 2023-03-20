import { FC, useEffect, PointerEvent } from 'react';
import { Titlebar } from './Titlebar';
import { nativeApps } from 'renderer/apps/nativeApps';
import { BrowserToolbarProps } from 'renderer/apps/Browser/Toolbar/BrowserToolbar';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import {
  DialogTitlebar,
  DialogTitlebarProps,
} from 'renderer/system/dialog/Dialog/DialogTitlebar';
import { AppWindowType } from 'os/services/shell/desktop.model';
import { ShellStoreType } from 'os/services/shell/shell.model';
import { ThemeType } from 'renderer/logic/theme';
import { NativeAppId, getNativeAppWindow } from '../getNativeAppWindow';
import { CampfireActions } from 'renderer/logic/actions/campfire';

type Props = {
  appWindow: AppWindowType;
  shell: ShellStoreType;
  currentTheme: ThemeType;
  hideTitlebarBorder: boolean;
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onDevTools: () => void;
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
};

export const TitlebarByType = ({
  appWindow,
  shell,
  currentTheme,
  hideTitlebarBorder,
  onDevTools,
  onDragStart,
  onDragEnd,
  onClose,
  onMaximize,
  onMinimize,
}: Props) => {
  let noTitlebar = false;
  let backButton = false;
  let CustomTitlebar: FC<BrowserToolbarProps> | FC<DialogTitlebarProps> | null;
  let showDevToolsToggle = true;
  let maximizeButton = true;

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
    hideTitlebarBorder = Boolean(
      nativeApps[appWindow.appId].native?.hideTitlebarBorder
    );
    noTitlebar = Boolean(nativeApps[appWindow.appId].native?.noTitlebar);
    backButton = Boolean(nativeApps[appWindow.appId].native?.backButton);
    console.log('back', backButton);
    CustomTitlebar =
      getNativeAppWindow[appWindow.appId as NativeAppId].titlebar;
    // TODO: Remove hardcoded showDevToolsToggle
    showDevToolsToggle = true;
    if (CustomTitlebar) {
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
      );
    } else {
      titlebar = (
        <Titlebar
          isAppWindow
          maximizeButton={maximizeButton}
          minimizeButton
          closeButton
          backButton={backButton}
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
          onBack={() => CampfireActions.setView('landing')}
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
    noTitlebar = Boolean(dialogConfig.noTitlebar);
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
