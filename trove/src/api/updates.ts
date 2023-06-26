import cloneDeep from 'lodash/cloneDeep';

import { isChildPath, log } from '../helpers';
import useTroveStore from '../store/troveStore';

const updateHandler = (update: any) => {
  log('update', update);
  const actionName: any = Object.keys(update?.update)[0];
  const updateData: any = update?.update;
  log('actionName', actionName);
  if (actionName) {
    switch (actionName) {
      case 'add-trove': {
        const state = useTroveStore.getState();

        const troveName = updateData[actionName].tope;
        const newTroves = cloneDeep(state.troves);
        //create a new trove
        const newTrove = {
          perms: updateData['add-trove'].perms,
          trove: updateData['add-trove'].trove,
          name: updateData['add-trove'].name,
          space: update.space,
        };
        //add it to our troves
        newTroves[troveName] = newTrove;
        //commit to state
        state.setTroves(newTroves);
        break;
      }
      case 'rem-trove': {
        const state = useTroveStore.getState();

        const troveName = updateData[actionName].tope;
        const newTroves = cloneDeep(state.troves);
        //delete the trove
        delete newTroves[troveName];
        //commit to state
        state.setTroves(newTroves);

        break;
      }
      case 'reperm': {
        const state = useTroveStore.getState();

        const troveName = update.tope;
        const newPerms = updateData[actionName].perms;

        const newTroves = cloneDeep(state.troves);
        //update the perms, we got a whole new set
        newTroves[troveName].perms = newPerms;

        //commit to state
        state.setTroves(newTroves);

        break;
      }
      case 'edit-name': {
        //update trove name
        const state = useTroveStore.getState();

        const troveName = update.tope;
        const newName = updateData[actionName].name;

        const newTroves = cloneDeep(state.troves);
        //update the title(name)
        newTroves[troveName].name = newName;

        //commit to state
        state.setTroves(newTroves);
        break;
      }
      case 'add-folder': {
        const newFolder = updateData[actionName].trail; //this gives us the name of the folder we just added
        const folderData = updateData[actionName].tract; //this gives us the metadata and data

        const troveName = update.tope;

        const state = useTroveStore.getState();

        const newTroves = cloneDeep(state.troves);
        //going to the affected trove and adding a folder inside [trove]
        newTroves[troveName].trove[newFolder] = folderData; //adding a new folder to our flatTree
        //update state
        state.setTroves(newTroves);
        break;
      }
      case 'rem-folder': {
        const deletedFolder = updateData[actionName].trail; //this gives us the name of the folder we just removed
        const troveName = update.tope;

        const state = useTroveStore.getState();

        const newTroves = cloneDeep(state.troves);
        //going to the affected trove and adding a folder inside [trove]
        delete newTroves[troveName].trove[deletedFolder];
        //delete all paths starting with deletedPath (children folders)
        for (const property in newTroves[troveName].trove) {
          if (isChildPath(deletedFolder, property)) {
            delete newTroves[troveName].trove[property];
          }
        }
        //update state
        state.setTroves(newTroves);
        break;
      }
      case 'move-folder': {
        const from = updateData[actionName].from;
        const to = updateData[actionName].to;
        const troveName = update.tope;

        const state = useTroveStore.getState();
        const newTroves = cloneDeep(state.troves);

        const currentTrove = newTroves[troveName].trove;
        const movedFolderCopy = cloneDeep(currentTrove[from]) || {}; //save a copy for the move operation
        //delete where we moved this folder from
        delete currentTrove[from];
        //add a folder where we moved it to reassigning all the old values
        currentTrove[to] = movedFolderCopy;

        //for all paths that started with the old path (from) we update them to start with the new path (to)
        for (const property in currentTrove) {
          if (isChildPath(from, property) && property !== to) {
            //(property !== to) => to prevent issues with repeating parts in relation to the replace action below (workaround, we can do better)

            const newPath = property.replace(from, to);

            currentTrove[newPath] = cloneDeep(currentTrove[property]);
            delete currentTrove[property];
          }
        }
        //update state
        state.setTroves(newTroves);

        break;
      }
      case 'add-node': {
        const newNode = updateData[actionName].node;
        const newNodeId = updateData[actionName].id;
        const pathToParent = updateData[actionName].trail;
        const troveName = update.tope;

        const state = useTroveStore.getState();

        const newTroves = cloneDeep(state.troves);
        ////add the new node at the specified path at the specified trove
        newTroves[troveName].trove[pathToParent] = {
          ...newTroves[troveName].trove[pathToParent],
          files: {
            ...newTroves[troveName].trove[pathToParent].files,
            [newNodeId]: newNode,
          },
        };
        //update state
        state.setTroves(newTroves);
        break;
      }
      case 'rem-node': {
        const pathToParent = updateData[actionName].trail;
        const removedNodeId = updateData[actionName].id;
        const troveName = update.tope;

        const state = useTroveStore.getState();

        const newTroves = cloneDeep(state.troves);
        //delete the node in our troves
        delete newTroves[troveName].trove[pathToParent].files[removedNodeId];

        //update state
        state.setTroves(newTroves);
        break;
      }
      case 'edit-node': {
        const newTitle = updateData[actionName].title;
        const newDescription = updateData[actionName].description;
        const pathToParent = updateData[actionName].trail;
        const nodeId = updateData[actionName].id;
        const troveName = update.tope;

        const state = useTroveStore.getState();
        const newTroves = cloneDeep(state.troves);

        newTroves[troveName].trove[pathToParent].files[nodeId] = {
          ...newTroves[troveName].trove[pathToParent].files[nodeId],
          dat: {
            ...newTroves[troveName].trove[pathToParent].files[nodeId].dat,
            title: newTitle,
            description: newDescription,
          },
        };

        state.setTroves(newTroves);

        break;
      }
      case 'move-node': {
        const from = updateData[actionName].from;
        const to = updateData[actionName].to;
        const nodeId = updateData[actionName].id;
        const troveName = update.tope;

        const state = useTroveStore.getState();
        const newTroves = cloneDeep(state.troves);

        const nodeCopy = cloneDeep(
          newTroves[troveName].trove[from].files[nodeId]
        );
        delete newTroves[troveName].trove[from].files[nodeId];
        newTroves[troveName].trove[to].files[nodeId] = nodeCopy;

        state.setTroves(newTroves);

        break;
      }
    }
  }
};

const updates = {
  app: 'trove',
  path: '/ui',
  event: updateHandler,
  //TODO: handle sub death/kick/err
  err: () => log('Subscription rejected'),
  quit: (e: any) => log('Kicked from subscription', e),
};
export default updates;
