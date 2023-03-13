import { InstallStatus } from 'os/services/spaces/models/bazaar';
import { SpacesActions } from 'renderer/logic/actions/spaces';

export const installLabel = (status: InstallStatus) => {
  switch (status) {
    case InstallStatus.installed:
      return 'Uninstall app';
    case InstallStatus.uninstalled:
    case InstallStatus.desktop:
      return 'Install app';
    case InstallStatus.started:
      return 'Cancel install';
    // case InstallStatus.failed:
    //   return 'Retry install';
    default:
      return 'Uninstall app';
  }
};

export const handleInstallation = (
  host: string | null,
  desk: string,
  status: InstallStatus
) => {
  if (
    [
      InstallStatus.uninstalled,
      InstallStatus.desktop,
      InstallStatus.failed,
    ].includes(status) &&
    !host
  ) {
    console.error('No host found for app', desk);
    return;
  }
  switch (status) {
    case InstallStatus.installed:
    case InstallStatus.suspended:
      SpacesActions.uninstallApp(desk);
      return;
    case InstallStatus.uninstalled:
    case InstallStatus.desktop:
      if (host) SpacesActions.installApp(host, desk);
      return;
    case InstallStatus.started:
      SpacesActions.uninstallApp(desk);
      return;
    case InstallStatus.failed:
      SpacesActions.uninstallApp(desk);
      return;
    default:
      console.error('Unknown install status', status);
  }
};

export const resumeSuspendLabel = (status: InstallStatus) => {
  if (status === InstallStatus.installed) {
    return 'Suspend app';
  } else {
    return 'Revive app';
  }
};

export const handleResumeSuspend = (desk: string, status: InstallStatus) => {
  if (status === InstallStatus.installed) {
    SpacesActions.suspendApp(desk);
  } else {
    SpacesActions.reviveApp(desk);
  }
};
