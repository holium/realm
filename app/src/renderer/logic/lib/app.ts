import { InstallStatus } from 'os/services/spaces/models/bazaar';

type AppStatusFlags = {
  isInstalled: boolean;
  isInstalling: boolean;
  isUninstalled: boolean;
  isFaded: boolean;
  isFailed: boolean;
  isSuspended: boolean;
  hasFailed: boolean;
};
export const getAppTileFlags = (
  installStatus: InstallStatus
): AppStatusFlags => {
  const isInstalling =
    installStatus !== InstallStatus.installed &&
    installStatus !== InstallStatus.suspended &&
    installStatus !== InstallStatus.failed &&
    installStatus !== InstallStatus.uninstalled;

  const isFaded =
    isInstalling ||
    installStatus === InstallStatus.suspended ||
    installStatus === InstallStatus.failed ||
    installStatus === InstallStatus.uninstalled;

  return {
    isInstalled: installStatus === InstallStatus.installed,
    isInstalling,
    isFaded,
    isSuspended: installStatus === InstallStatus.suspended,
    isFailed: installStatus === InstallStatus.failed,
    isUninstalled: installStatus === InstallStatus.uninstalled,
    hasFailed: installStatus === InstallStatus.failed,
  };
};
