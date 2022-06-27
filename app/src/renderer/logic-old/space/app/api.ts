export async function getApps() {
  try {
    const response = await window.electron.ship.getApps();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  getApps,
};
