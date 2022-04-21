async function authenticate(ship: string, url: string, code: string) {
  try {
    const response = await window.electron.auth.addShip(ship, url, code);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function getShips() {
  try {
    const response = await window.electron.auth.getShips();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}
async function removeShip(ship: string) {
  try {
    const response = await window.electron.auth.removeShip(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  authenticate,
  getShips,
  removeShip,
};
