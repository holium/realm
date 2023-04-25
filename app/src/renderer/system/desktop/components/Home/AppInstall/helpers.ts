import { InstallStatus } from 'renderer/stores/models/bazaar.model';
import { shipStore } from '../../../../../stores/ship.store';

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
  const { bazaarStore } = shipStore;
  switch (status) {
    case InstallStatus.installed:
    case InstallStatus.suspended:
      bazaarStore.uninstallApp(desk);
      return;
    case InstallStatus.uninstalled:
    case InstallStatus.desktop:
      if (host) bazaarStore.installApp(host, desk);
      return;
    case InstallStatus.started:
      bazaarStore.uninstallApp(desk);
      return;
    case InstallStatus.failed:
      bazaarStore.uninstallApp(desk);
      return;
    case InstallStatus.reviving:
      bazaarStore.uninstallApp(desk);
      return;
    case InstallStatus.suspending:
      bazaarStore.uninstallApp(desk);
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
  const { bazaarStore } = shipStore;
  if (status === InstallStatus.installed) {
    bazaarStore.suspendApp(desk);
  } else {
    bazaarStore.reviveApp(desk);
  }
};
