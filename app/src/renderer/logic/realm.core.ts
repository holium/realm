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

export async function onBoot() {
  return await window.electron.os.boot();
}

export async function applyAction(action: any) {
  return await window.electron.os.applyAction(action);
}

export default {
  sendAction,
  onStart,
};
