import { InstallStatus } from 'os/services/spaces/models/bazaar';

type AppStatusFlags = {
  isInstalled: boolean;
  isInstalling: boolean;
  isUninstalled: boolean;
  isFaded: boolean;
  isFailed: boolean;
  isSuspended: boolean;
  hasFailed: boolean;
  isDesktop: boolean;
};
export const getAppTileFlags = (
  installStatus: InstallStatus
): AppStatusFlags => {
  const isInstalling =
    installStatus !== InstallStatus.installed &&
    installStatus !== InstallStatus.suspended &&
    installStatus !== InstallStatus.failed &&
    installStatus !== InstallStatus.uninstalled &&
    installStatus !== InstallStatus.desktop;

  const isFaded =
    isInstalling ||
    installStatus === InstallStatus.suspended ||
    installStatus === InstallStatus.failed ||
    installStatus === InstallStatus.uninstalled ||
    installStatus === InstallStatus.desktop;

  return {
    isInstalled: installStatus === InstallStatus.installed,
    isInstalling,
    isFaded,
    isSuspended: installStatus === InstallStatus.suspended,
    isFailed: installStatus === InstallStatus.failed,
    isUninstalled: installStatus === InstallStatus.uninstalled,
    hasFailed: installStatus === InstallStatus.failed,
    isDesktop: installStatus === InstallStatus.desktop,
  };
};
