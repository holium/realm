export function openAppWindow(app: any, partition: string) {
  return window.electron.app.openApp(app, partition);
}
export function setActive(spacePath: string, app: any) {
  return window.electron.os.shell.setActive(spacePath, app);
}
export function setPartitionCookies(partition: string, cookies: any) {
  return window.electron.app.setPartitionCookies(partition, cookies);
}

export async function closeAppWindow(app: any) {
  return window.electron.app.closeApp(app);
}

export async function toggleDevTools() {
  return window.electron.app.toggleDevTools();
}

export default {
  openAppWindow,
  closeAppWindow,
};
