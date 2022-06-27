export async function init(ship: string) {
  try {
    const response = await window.electron.core.init(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function getAppPreview(ship: string, desk: string) {
  try {
    const response = await window.electron.ship.getAppPreview(ship, desk);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}
