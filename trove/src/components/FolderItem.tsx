import { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { isChildPath, splitLastOccurrence } from '../helpers';
import {
  editFolderAction,
  moveFileAction,
  moveFolderAction,
  removeFolderAction,
} from '../store/troveActions';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { theme } from '../theme';
import { ContextMenu } from './ContextMenu';
import { CustomTextField } from './CustomTextField';

export const FolderItem = ({
  children,
  parentCount,
  path,
  selected,
  handleSelection,
  writePerms,
}: any) => {
  const setSelectedNode = useTroveStore(
    (store: TroveStore) => store.setSelectedNode
  );
  const [displayName, setDisplayName] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');

  useEffect(() => {
    //we want the display name to be the final part of the path
    if (path) {
      const newDisplayName = splitLastOccurrence(path, '/')[1];
      setDisplayName(newDisplayName);
    }
  }, [path]);
  const [isOpen, setIsOpen] = useState(false);

  const listItems = [
    {
      onClick: () => {
        setEditing(true);
        setNewTitle(displayName);
        //unselected this after hitting edit
        setSelectedNode(null);
      },
      title: 'Edit folder',
    },
    {
      onClick: () => {
        removeFolderAction(path);
        //unselected this after deletion
        setSelectedNode(null);
      },
      title: 'Delete folder',
    },
  ];
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ['file', 'folder'],
      drop: (data: any) => {
        if (data?.ddType === 'folder') {
          //can not drop a folder on it'self
          if (data.path === path) return;
          //can not move a folder into it's own children
          if (isChildPath(data.path, path)) return;
          //can not move a folder in place
          if (splitLastOccurrence(data.path, '/')[0] === path) return;

          moveFolderAction(data.path, path);
        } else if (data?.ddType === 'file') {
          moveFileAction(data.id, path);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    []
  );
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'folder',
    item: { path: path, ddType: 'folder' },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const getBackground = () => {
    if (isOver) return theme.background.secondary;
    else if (isDragging) return theme.background.secondary;
    else if (selected?.id === path) return theme.background.active;
    else return 'transparent';
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //submit input
    if (event.key === 'Enter') {
      if (newTitle) {
        editFolderAction(path, newTitle);
        onDone();
      }
      event.preventDefault();
    }
    //close the input
    if (event.key === 'Escape') {
      onDone();
    }
  };
  const onDone = () => {
    setNewTitle('');
    setEditing(false);
  };
  return (
    <Box>
      <Grid
        ref={drop}
        container
        sx={{
          backgroundColor: getBackground(),
          '&:hover': {
            backgroundColor: theme.background.hover,
          },
          margin: '4px 0',
          padding: '0 6px',
          borderRadius: '6px',
        }}
        alignItems="center"
        onClick={() => {
          handleSelection({ id: path, type: 'folder' });
        }}
      >
        <Grid item md={11} ref={drag}>
          <Stack
            direction={'row'}
            alignItems="center"
            style={{ paddingLeft: parentCount * 20 }}
          >
            {children?.length > 0 && (
              <Stack
                onClick={(e: any) => {
                  //don't mess with the selection
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
                alignContent="center"
                marginRight="4px"
              >
                {isOpen ? (
                  <ExpandMoreIcon
                    sx={{ fontSize: '14px' }}
                    htmlColor={theme.icon.primary}
                  />
                ) : (
                  <ChevronRightIcon
                    sx={{ fontSize: '14px' }}
                    htmlColor={theme.icon.primary}
                  />
                )}
              </Stack>
            )}
            {parentCount > 0 && children?.length === 0 && (
              <Box width={'18.83px'}></Box>
            )}
            {editing ? (
              <CustomTextField
                autoFocus
                value={newTitle}
                onChange={(event: any) => {
                  setNewTitle(event.target.value);
                }}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <Typography variant="subtitle2" color={theme.text.primary}>
                {displayName}
              </Typography>
            )}
          </Stack>
        </Grid>
        <Grid item md={1} justifyContent="flex-start">
          <Stack
            direction={'row'}
            alignItems="center"
            justifyContent={'flex-end'}
          >
            {writePerms && <ContextMenu id={path} listItems={listItems} />}
          </Stack>
        </Grid>

        <Divider />
      </Grid>
      <Box
        style={{
          position: 'relative',
          height: !isOpen ? '0px' : 'auto',
          overflow: !isOpen ? 'hidden' : 'visible',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
