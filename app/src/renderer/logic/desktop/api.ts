export function openAppWindow(app: any, partition: string) {
  try {
    const response = window.electron.app.openApp(app, partition);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export function setPartitionCookies(partition: string, cookies: any) {
  try {
    const response = window.electron.app.setPartitionCookies(
      partition,
      cookies
    );
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function closeAppWindow(app: any) {
  try {
    const response = window.electron.app.closeApp(app);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function toggleDevTools() {
  try {
    const response = window.electron.app.toggleDevTools();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  openAppWindow,
  closeAppWindow,
};
