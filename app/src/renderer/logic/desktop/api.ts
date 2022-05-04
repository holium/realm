export async function openAppWindow(app: any, config: any) {
  try {
    const response = await window.electron.app.openApp(app, config);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function closeAppWindow(app: any) {
  try {
    const response = await window.electron.app.closeApp(app);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  openAppWindow,
  closeAppWindow,
};
