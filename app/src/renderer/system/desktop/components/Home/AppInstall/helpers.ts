import { InstallStatus } from 'os/services/spaces/models/bazaar';
import { SpacesActions } from 'renderer/logic/actions/spaces';

export const installLabel = (status: InstallStatus) => {
  switch (status) {
    case InstallStatus.installed:
      return 'Uninstall app';
    case InstallStatus.uninstalled:
      return 'Install app';
    case InstallStatus.started:
      return 'Cancel install';
    case InstallStatus.failed:
      return 'Retry install';
    default:
      return 'Cancel install';
  }
};

export const handleInstallation = (
  host: string | null,
  desk: string,
  status: InstallStatus
) => {
  if (
    [InstallStatus.uninstalled, InstallStatus.failed].includes(status) &&
    !host
  ) {
    console.error('No host found for app', desk);
    return;
  }
  switch (status) {
    case InstallStatus.installed:
      SpacesActions.uninstallApp(desk);
      return;
    case InstallStatus.uninstalled:
      SpacesActions.installApp(host!, desk);
      return;
    case InstallStatus.started:
      SpacesActions.uninstallApp(desk);
      return;
    case InstallStatus.failed:
      SpacesActions.installApp(host!, desk);
      return;
    default:
      console.error('Unknown install status', status);
  }
};
