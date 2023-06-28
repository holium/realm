import { memo } from 'react';
import Box from '@mui/material/Box';

import { FileItem } from './FileItem';
import { FolderItem } from './FolderItem';
//TODO: make two components for folders and one for files
export const RecursiveTree = memo(
  ({ itemList, handleSelection, selected, writePerms, deleteFile }: any) => {
    const createTree = (name: any, data: any, parentCount = 0) => {
      if (data.type === 'folder') {
        return (
          <FolderItem
            path={name} //this is a path
            item={data}
            key={name}
            parentCount={parentCount}
            handleSelection={handleSelection}
            selected={selected}
            writePerms={writePerms}
          >
            {data?.children.map((item: any) => {
              const newParentCount = parentCount + 1;

              if (item.type === 'folder') {
                return createTree(item.path, item, newParentCount);
              } else {
                const fileItem: any = Object.entries(item);
                const name = fileItem[0][0];
                const fileData = fileItem[0][1];
                return createTree(
                  fileData.dat.title,
                  { ...fileData, id: name },
                  newParentCount
                );
              }
            })}
          </FolderItem>
        );
      } else {
        return (
          <FileItem
            title={name}
            item={data}
            parentCount={parentCount}
            handleSelection={handleSelection}
            selected={selected}
            key={data.id}
            writePerms={writePerms}
            deleteFile={deleteFile}
          />
        );
      }
    };
    return (
      <Box>
        {itemList.map((item: any) => {
          if (item.type === 'folder') {
            return createTree(item.path, item);
          } else {
            const fileItem: any = Object.entries(item);
            const name = fileItem[0][0];
            const fileData = fileItem[0][1];

            return createTree(fileData.dat.title, { ...fileData, id: name });
          }
        })}
      </Box>
    );
  }
);
