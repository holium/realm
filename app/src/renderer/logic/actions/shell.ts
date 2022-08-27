import { ShellService } from 'os/services/shell/shell.service';

/**
 * ShellActions for interfacing with core process
 */
type ShellActionType = typeof ShellService.preload;
export const ShellActions: ShellActionType = window.electron.os.shell;
