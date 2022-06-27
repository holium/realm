export async function setShipTheme(ship: string, theme: any) {
  try {
    const response = await window.electron.theme.setShipTheme(ship, theme);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

async function setSpaceTheme(ship: string, theme: any) {
  try {
    const response = await window.electron.theme.setSpaceTheme(ship, theme);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  setShipTheme,
  setSpaceTheme,
};
