export async function getDMs() {
  try {
    const response = await window.electron.ship.getDMs();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  getDMs,
};
