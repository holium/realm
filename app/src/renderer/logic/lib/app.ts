import { InstallStatus } from 'os/services/spaces/models/bazaar';

type AppStatusFlags = {
  isInstalled: boolean;
  isInstalling: boolean;
  isUninstalled: boolean;
  isFaded: boolean;
  isSuspended: boolean;
  hasFailed: boolean;
};
export const getAppTileFlags = (
  installStatus: InstallStatus
): AppStatusFlags => {
  const isInstalling =
    installStatus !== InstallStatus.installed &&
    installStatus !== InstallStatus.suspended &&
    installStatus !== InstallStatus.failed;

  const isFaded = isInstalling || installStatus === InstallStatus.suspended;
  const isSuspended = installStatus === InstallStatus.suspended;
  return {
    isInstalled: installStatus === InstallStatus.installed,
    isInstalling,
    isFaded,
    isSuspended,
    isUninstalled: installStatus === InstallStatus.uninstalled,
    hasFailed: installStatus === InstallStatus.failed,
  };
};
