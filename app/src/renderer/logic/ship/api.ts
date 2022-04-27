export async function init(ship: string) {
  try {
    const response = await window.electron.core.init(ship);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}
