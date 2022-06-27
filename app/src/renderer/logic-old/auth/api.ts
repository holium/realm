async function addShip(ship: string, url: string, code: string) {
  try {
    const response = await window.electron.auth.addShip(ship, url, code);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function getShips() {
  try {
    const response = await window.electron.os.auth.getShips();
    console.log('getting new ships', response);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function removeShip(ship: string) {
  try {
    const response = await window.electron.core.removeShip(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function getProfile(ship: string) {
  try {
    const response = await window.electron.auth.getProfile(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}
async function saveProfile(
  ship: string,
  data: { nickname: string; color: string; avatar: string }
) {
  try {
    const response = await window.electron.auth.saveProfile(ship, data);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function storeNewShip(ship: string) {
  try {
    const response = await window.electron.core.storeNewShip(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function setSelected(ship: string) {
  try {
    const response = await window.electron.auth.setSelected(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function logout(ship: string) {
  try {
    const response = await window.electron.core.logout(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function login(ship: string, password: string) {
  try {
    const response = await window.electron.core.login(ship, password);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  login,
  logout,
  addShip,
  getShips,
  removeShip,
  getProfile,
  saveProfile,
  storeNewShip,
  setSelected,
};
