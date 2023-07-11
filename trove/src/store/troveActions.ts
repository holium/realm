import { log, splitLastOccurrence } from '../helpers';
import useTroveStore from './troveStore';
const moveFileAction = async (fileId: string, toPath: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const troves = state.troves;
  const currentSpace = state.currentSpace;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;

  if (!api) return;
  if (!selectedTopLevelFolder) return;
  //TODO: make getting parent folder it's own function
  let parentFolder;

  const currentTrove = troves[selectedTopLevelFolder].trove;
  for (const property in currentTrove) {
    for (const childProperty in currentTrove[property].files) {
      if (fileId === childProperty) {
        parentFolder = property;
        break;
      }
    }
  }
  if (!parentFolder) return;

  try {
    const result = await api.moveFile(
      currentSpace,
      selectedTopLevelFolder,
      fileId,
      parentFolder,
      toPath
    );
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const removeFileAction = async (fileId: string) => {
  //look up the parent of the file id
  const state = useTroveStore.getState();
  const api = state.api;
  const troves = state.troves;
  const currentSpace = state.currentSpace;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;
  //TODO: make getting parent folder it's own function
  let parentFolder;

  if (!api) return;
  if (!selectedTopLevelFolder) return;
  const currentTrove = troves[selectedTopLevelFolder].trove;
  for (const property in currentTrove) {
    for (const childProperty in currentTrove[property].files) {
      if (fileId === childProperty) {
        parentFolder = property;
        break;
      }
    }
  }
  if (!parentFolder) return;
  try {
    const result = await api.removeFile(
      currentSpace,
      selectedTopLevelFolder,
      fileId,
      parentFolder
    );
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const addFileAction = async (metadata: any) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const selectedNode = state.selectedNode;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;

  //this a little problematic since we can't use fucking ids as trails
  const currentSpace = state.currentSpace;

  let parentFolder;
  if (!selectedNode) {
    //nothing selected,we add at the top level folder here
    parentFolder = selectedTopLevelFolder;
  } else if (selectedNode.type === 'file') {
    parentFolder = selectedTopLevelFolder;
  } else {
    parentFolder = selectedNode.id;
  }
  if (parentFolder === selectedTopLevelFolder) {
    //this is being added at root, we give it '/'
    parentFolder = '/';
  }
  if (!parentFolder) return;
  if (!api) return;

  log(metadata);

  return await api.addFile(
    currentSpace,
    selectedTopLevelFolder,
    parentFolder,
    metadata.url,
    metadata.title,
    '',
    metadata.extension,
    metadata.size,
    metadata.key
  );
};
const removeFolderAction = async (pathToFolder: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;
  if (!api) return;
  try {
    const result = await api.removeFolder(
      currentSpace,
      selectedTopLevelFolder,
      pathToFolder
    );
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const removeTroveAction = async (troveName: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  if (!api) return;
  try {
    const result = await api.removeTrove(currentSpace, troveName);
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const editTroveAction = async (newTitle: string, trove: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  if (!api) return;
  try {
    const result = await api.editTrove(currentSpace, trove, newTitle);
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const repermTroveAction = async (troveName: string, perms: any) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  if (!api) return;
  try {
    const result = await api.repermTrove(currentSpace, troveName, perms);
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const moveFolderAction = async (fromPath: string, toPath: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;
  if (!api) return;
  let newFolderPath;
  if (toPath === '/') {
    //if to path is the root, we don't use the '/'
    newFolderPath = '/' + splitLastOccurrence(fromPath, '/')[1];
  } else {
    newFolderPath = toPath + '/' + splitLastOccurrence(fromPath, '/')[1];
  }

  try {
    const result = await api.moveFolder(
      currentSpace,
      selectedTopLevelFolder,
      fromPath,
      newFolderPath
    );
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const editFolderAction = async (fromPath: string, newName: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;
  if (!api) return;
  //from and to path are the same, we change the display name (the last part of the folder) to rename it
  const newFolderPath = splitLastOccurrence(fromPath, '/')[0] + '/' + newName;
  try {
    const result = await api.moveFolder(
      currentSpace,
      selectedTopLevelFolder,
      fromPath,
      newFolderPath
    );
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
const editFileAction = async (fileId: string, newTitle: string) => {
  const state = useTroveStore.getState();
  const api = state.api;
  const currentSpace = state.currentSpace;
  const troves = state.troves;
  const selectedTopLevelFolder = state.selectedTopLevelFolder;

  let parentFolder;
  //TODO: make getting parent folder it's own function
  if (!api) return;
  if (!selectedTopLevelFolder) return;

  const currentTrove = troves[selectedTopLevelFolder].trove;
  for (const property in currentTrove) {
    for (const childProperty in currentTrove[property].files) {
      if (fileId === childProperty) {
        parentFolder = property;
        break;
      }
    }
  }
  if (!parentFolder) return;
  try {
    const result = await api.editFile(
      currentSpace,
      selectedTopLevelFolder,
      fileId,
      parentFolder,
      newTitle
    );
    log('result', result);
  } catch (e) {
    log('error ', e);
  }
};
export {
  addFileAction,
  editFileAction,
  editFolderAction,
  editTroveAction,
  moveFileAction,
  moveFolderAction,
  removeFileAction,
  removeFolderAction,
  removeTroveAction,
  repermTroveAction,
};
