export async function getDMs() {
  try {
    const response = await window.electron.ship.getDMs();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function sendDm(toShip: string, content: any) {
  try {
    const response = await window.electron.ship.sendDm(toShip, content);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  getDMs,
  sendDm,
};
