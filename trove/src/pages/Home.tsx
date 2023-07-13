import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Aside, Main, NavigationHeader } from '../components';
import { log, splitLastOccurrence } from '../helpers';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { Role } from '../types';

export const Home = ({ useStorage, uploadFile, deleteFile }: any) => {
  const api = useTroveStore((store: TroveStore) => store.api);
  const space = useTroveStore((store: TroveStore) => store.space);
  const troves = useTroveStore((store: TroveStore) => store.troves);
  const setTroves = useTroveStore((store: TroveStore) => store.setTroves);
  const setMyPerms = useTroveStore((store: TroveStore) => store.setMyPerms);
  const shipName = useTroveStore((store: TroveStore) => store.shipName);
  const mySpace = useTroveStore((store: TroveStore) => store.mySpace);
  const setInPersonalSpace = useTroveStore(
    (store: TroveStore) => store.setInPersonalSpace
  );

  const dateSorting = useTroveStore((store: TroveStore) => store.dateSorting);

  const troveRenderTree = useTroveStore(
    (store: TroveStore) => store.troveRenderTree
  );
  const setTroveRenderTree = useTroveStore(
    (store: TroveStore) => store.setTroveRenderTree
  );

  const setTopLevelFolders = useTroveStore(
    (store: TroveStore) => store.setTopLevelFolders
  );

  const setCurrentSpace = useTroveStore(
    (store: TroveStore) => store.setCurrentSpace
  );

  const myRole = useTroveStore((store: TroveStore) => store.myRole);
  const setMyRole = useTroveStore((store: TroveStore) => store.setMyRole);

  const sortTree = (list: any) => {
    //given a list of nodes and folders, sorts them
    return list.sort((a: any, b: any) => {
      //we need to know if it's a file or not and compare accordingly]
      let sortValue = 0;

      if (a.type === 'folder' && b.type === 'folder') {
        if (dateSorting === 'asc') {
          sortValue = a.timestamp - b.timestamp;
        } else {
          sortValue = b.timestamp - a.timestamp;
        }
      } else if (a.type === 'folder' && b.type !== 'folder') {
        const bKey = Object.keys(b)[0];

        if (dateSorting === 'asc') {
          sortValue = a.timestamp - b[bKey].dat.from;
        } else {
          sortValue = b[bKey].dat.from - a.timestamp;
        }
      } else if (a.type !== 'folder' && b.type === 'folder') {
        const aKey = Object.keys(a)[0];
        if (dateSorting === 'asc') {
          sortValue = a[aKey].dat.from - b.timestamp;
        } else {
          sortValue = b.timestamp - a[aKey].dat.from;
        }
      } else if (a.type !== 'folder' && b.type !== 'folder') {
        const aKey = Object.keys(a)[0];
        const bKey = Object.keys(b)[0];
        if (dateSorting === 'asc') {
          sortValue = a[aKey].dat.from - b[bKey].dat.from;
        } else {
          sortValue = b[bKey].dat.from - a[aKey].dat.from;
        }
      }

      return sortValue;
    });
  };
  const makeTree = (troves: any) => {
    //given a map of path to data, create a nested tree structure deonating child-parent relationships
    const allPathLists = [];
    try {
      for (const prop1 in troves) {
        const pathParts = prop1.split('/');
        pathParts.shift(); // Remove first blank element from the parts array.
        allPathLists.push(pathParts);
      }
      let newTree = makeATree(allPathLists, troves);
      //get the root '/' and copy all it's children into the root and delete it
      newTree.every((item: any, index: number) => {
        if (item.path === '/') {
          newTree = [...newTree, ...item.children]; //combine roots files with the tree
          newTree.splice(index, 1);
          return false;
        }
        return true;
      });
      sortTree(newTree); //sort our root files
      return newTree;
    } catch (e) {
      console.log('e', e);
    }
  };
  const makeATree = (paths: any, data: any) => {
    const tree: any = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      let currentLevel = tree;
      for (let j = 0; j < path.length; j++) {
        const part = path[j];

        let totalPath = '';
        for (let k = 0; k < j + 1; k++) {
          if (!totalPath) {
            totalPath = '/' + path[k];
          } else {
            totalPath = totalPath + '/' + path[k];
          }
        }

        const existingPath = findWhere(currentLevel, 'text', part);
        if (existingPath) {
          currentLevel = sortTree(existingPath.children);
        } else {
          const newPart = {
            text: part,
            path: totalPath,
            type: 'folder',
            timestamp: data[totalPath].from,
            children: data[totalPath].files
              ? sortTree(
                  //we have to sort here incase we only have files here and no folders
                  Object.entries(data[totalPath].files).map((item) => {
                    return { [item[0]]: item[1] };
                  })
                )
              : [],
          };

          currentLevel.push(newPart);
          currentLevel = sortTree(currentLevel);
          currentLevel = newPart.children;
        }
      }
    }
    return tree;

    function findWhere(array: any, key: any, value: any) {
      let t = 0;
      while (t < array.length && array[t][key] !== value) {
        t++;
      }

      if (t < array.length) {
        return array[t];
      } else {
        return false;
      }
    }
  };

  useEffect(() => {
    getTroves();
  }, [space]);

  const getPerm = (
    permObj: any,
    troveName: string
  ): { isOwner: boolean; isAdmin: boolean; perms: 'r' | 'rw' } => {
    //add isAdmin and isOwner
    const troveOwner = troveName.split('/')[0];
    const currentShip = shipName;
    const isOwner = currentShip === troveOwner;
    const isAdmin = myRole === 'admin';
    //if we own this trove, we get "rw" perms
    if (isOwner) {
      return { isOwner, isAdmin, perms: 'rw' };
    }

    const customPerms = permObj.custom[currentShip];

    let regularPerms;
    if (isAdmin) {
      regularPerms = permObj.admins;
    } else if (myRole === 'member') {
      regularPerms = permObj.member;
    }
    //we select the heighst perms between the regularPerms and the customPerms

    if (customPerms === 'rw') return { isOwner, isAdmin, perms: 'rw' };
    if (regularPerms === 'rw') return { isOwner, isAdmin, perms: 'rw' };
    else return { isOwner, isAdmin, perms: 'r' };
  };
  useEffect(() => {
    if (troves) {
      //loop through troves to get our top level folders
      const newTopLevelFolders: any = [];
      const newTroveTree: any = {};
      const myPerms: any = {};

      for (const trove in troves) {
        newTroveTree[trove] = makeTree(troves[trove].trove);
        newTopLevelFolders.push({
          title: troves[trove].name,
          space: troves[trove].space,
          trove,
          isPrivate: !troves[trove].perms.member ? true : false, //if no member perms this trove isPrivate
          perms: troves[trove].perms,
        });
        myPerms[trove] = getPerm(troves[trove].perms, trove);
      }
      setMyPerms(myPerms);
      setTroveRenderTree(newTroveTree);
      setTopLevelFolders(newTopLevelFolders);
    }
  }, [troves, dateSorting]);

  const getMyRole = async () => {
    if (!api) return;
    try {
      const members = await api.getMembers(space);
      const myRoles = members.members[shipName].roles;
      //look for owner then look for admin, then look for member
      const myRole: Role = myRoles.includes('admin') ? 'admin' : 'member';

      setMyRole(myRole);
    } catch (e) {
      log('getMyRole error =>', e);
    }
  };
  const getTroves = async () => {
    if (!api) return;
    try {
      getMyRole();
      setCurrentSpace(space); //we use this to switch between our and current space for calling pokes
      if (splitLastOccurrence(space, '/')[1] === 'our') {
        setInPersonalSpace(true);
        //user is in his own personal space (our)
        //just fetch current space
        const response = await api.getTroves(space);

        const newTroves: any = {};
        for (const trove in response.view.troves) {
          newTroves[trove] = { ...response.view.troves[trove], space };
        }
        setTroves(newTroves); //TODO: update to be called troves or something similar
      } else {
        setInPersonalSpace(false);
        const response = await api.getTroves(space);
        //fetch current space and fetch our space
        const personalTrove = await api.getTroves(mySpace);
        //view => troves (map of name to perms and trove (where the folders exist))
        const newTroves: any = {};
        for (const trove in response.view.troves) {
          newTroves[trove] = { ...response.view.troves[trove], space };
        }
        const newPersonalTrove: any = {};
        for (const trove in personalTrove.view.troves) {
          newPersonalTrove[trove] = {
            ...personalTrove.view.troves[trove],
            space: mySpace,
          };
        }
        setTroves({ ...newTroves, ...newPersonalTrove });
      }
    } catch (e) {
      console.log('error =>', e);
    }
  };

  return (
    <Box height="100%">
      <NavigationHeader />
      <Stack direction="row" spacing={'4px'} height="100%">
        <Aside />
        <DndProvider backend={HTML5Backend}>
          <Main
            troveRenderTree={troveRenderTree}
            useStorage={useStorage}
            uploadFile={uploadFile}
            deleteFile={deleteFile}
          />
        </DndProvider>
      </Stack>
    </Box>
  );
};
