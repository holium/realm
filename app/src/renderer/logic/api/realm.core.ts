export async function sendAction(action: any) {
  try {
    const response = await window.electron.core.action(action);
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export async function onStart() {
  try {
    const response = await window.electron.core.onStart();
    return [response, null];
  } catch (err) {
    return [null, err];
  }
}

export default {
  sendAction,
  onStart,
};
