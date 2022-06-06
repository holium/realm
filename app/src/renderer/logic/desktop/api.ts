export function openAppWindow(app: any) {
  try {
    const response = window.electron.app.openApp(app);
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
