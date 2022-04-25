export async function getApps(callback: any) {
  try {
    const response = await window.electron.ship.getApps(callback);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  getApps,
};
