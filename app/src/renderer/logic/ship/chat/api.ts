export async function getDMs() {
  try {
    const response = await window.electron.ship.getDMs();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function sendDm(toShip: string, content: any[]) {
  try {
    const response = await window.electron.ship.sendDm(toShip, content);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function acceptDm(toShip: string) {
  try {
    const response = await window.electron.ship.acceptDm(toShip);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function declineDm(toShip: string) {
  try {
    const response = await window.electron.ship.declineDm(toShip);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function setScreen(screen: boolean) {
  try {
    const response = await window.electron.ship.setScreen(screen);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}
