export async function onBoot() {
  return await window.electron.os.boot();
}

export async function applyAction(action: any) {
  return await window.electron.os.applyAction(action);
}
