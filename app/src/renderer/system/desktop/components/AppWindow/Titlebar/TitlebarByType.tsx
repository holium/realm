import { FC, PointerEvent } from 'react';

import { BrowserToolbarProps } from 'renderer/apps/Browser/Toolbar/BrowserToolbar';
import { nativeApps } from 'renderer/apps/nativeApps';
import { ShellModelType } from 'renderer/stores/models/shell.model';
import { AppWindowMobxType } from 'renderer/stores/models/window.model';
import {
  DialogTitlebar,
  DialogTitlebarProps,
} from 'renderer/system/dialog/Dialog/DialogTitlebar';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';

import { getNativeAppWindow, NativeAppId } from '../getNativeAppWindow';
import { Titlebar } from './Titlebar';

type Props = {
  appWindow: AppWindowMobxType;
  shell: ShellModelType;
  hideTitlebarBorder: boolean;
  onClose: () => void;
  toggleMaximize: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  onDevTools: () => void;
  onDragStart: (e: PointerEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
};

export const TitlebarByType = ({
  appWindow,
  shell,
  hideTitlebarBorder,
  onDevTools,
  onDragStart,
  onDragEnd,
  onClose,
  onMaximize,
  onMinimize,
  toggleMaximize,
}: Props) => {
  let noTitlebar = false;
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
      toggleMaximize={toggleMaximize}
      onMaximize={onMaximize}
      onMinimize={onMinimize}
      appWindow={appWindow}
    />
  );

  if (appWindow.type === 'native') {
    hideTitlebarBorder = Boolean(
      nativeApps[appWindow.appId].native?.hideTitlebarBorder
    );
    noTitlebar = Boolean(nativeApps[appWindow.appId].native?.noTitlebar);
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
          toggleMaximize={toggleMaximize}
        />
      );
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
          toggleMaximize={toggleMaximize}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
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
    showDevToolsToggle = false;
    maximizeButton = false;

    if (noTitlebar) {
      titlebar = <div />;
    } else {
      titlebar = (
        <DialogTitlebar
          zIndex={appWindow.zIndex}
          showDevToolsToggle
          onOpen={dialogConfig.onOpen}
          onClose={onCloseDialog}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      );
    }
  }

  return titlebar;
};
