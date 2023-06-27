import { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Lightbox from 'yet-another-react-lightbox';

import { copyToClipboard, downloadURI, isImage, log } from '../helpers';
import { editFileAction, removeFileAction } from '../store/troveActions';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { theme } from '../theme';
import { displayDate } from '../time';
import { ContextMenu } from './ContextMenu';
import { CustomTextField } from './CustomTextField';

import 'yet-another-react-lightbox/styles.css';

export const FileItem = ({
  parentCount,
  item = {},
  title,
  selected,
  writePerms,
}: any) => {
  const setSelectedNode = useTroveStore(
    (store: TroveStore) => store.setSelectedNode
  );
  const [LightboxOpen, setLightboxOpen] = useState(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');

  const [listItems, setListItems] = useState<any>([]);
  const baseListItems = [
    {
      onClick: async () => {
        try {
          const response = await copyToClipboard(item.url);
          log('copyToClipboard res => ', response);
        } catch (e) {
          log('copyToClipboard error => ', e);
        }
      },
      title: 'Copy url',
    },

    {
      onClick: () => {
        downloadURI(title, item.url, item.dat.extension);
      },
      title: 'Download file',
    },
    {
      onClick: () => {
        setEditing(true);
        setNewTitle(title);
      },
      title: 'Edit file',
    },
    {
      onClick: async () => {
        //remove it from S3 (try)
        //api.deleteFile(item.dat.key); TODO: make a delete function
        //remove it from trove
        removeFileAction(item.id);
        //unselected this after deletion
        setSelectedNode(null);
      },
      title: 'Delete file',
    },
  ];
  useEffect(() => {
    if (item) {
      if (isImage(item.dat.extension)) {
        const listItems = [
          {
            onClick: () => {
              setLightboxOpen(true);
            },
            title: 'Preview image',
          },
          ...baseListItems,
        ];
        setListItems(listItems);
      } else {
        setListItems(baseListItems);
      }
    }
  }, [item]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //submit input
    if (event.key === 'Enter') {
      if (newTitle) {
        editFileAction(item.id, newTitle);
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
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'file',
    item: { ...item, ddType: 'file' },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getBackground = () => {
    if (selected?.id === item.id) return theme.background.secondary;
    else if (isDragging) return theme.background.secondary;
    else return 'transparent';
  };
  return (
    <Box>
      <Lightbox
        open={LightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: item.url }]}
      />
      <Grid
        ref={drag}
        container
        sx={{
          backgroundColor: getBackground(),
          margin: '4px 0',
          padding: '0 6px',
          borderRadius: '6px',
          '&:hover': {
            backgroundColor: theme.background.hover,
          },
        }}
        alignItems="center"
        onDoubleClick={() => {
          if (isImage(item.dat.extension)) {
            setLightboxOpen(true);
          }
        }}
      >
        <Grid item md={7}>
          <Stack
            direction={'row'}
            alignItems="center"
            style={{ paddingLeft: parentCount * 20 }}
          >
            {parentCount > 0 && <Box width={'18.83px'}></Box>}
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
                {title}
              </Typography>
            )}
          </Stack>
        </Grid>
        <Grid item md={1}>
          <Typography
            variant="subtitle2"
            color={theme.text.secondary}
            sx={{ opacity: 0.7 }}
          >
            {item.dat.size}
          </Typography>
        </Grid>
        <Grid item md={3}>
          <Typography
            variant="subtitle2"
            color={theme.text.secondary}
            sx={{ opacity: 0.7 }}
          >
            {displayDate(item.dat.from, {
              long: false,
              dayOnly: false,
            })}
          </Typography>
        </Grid>
        <Grid item md={1}>
          <Stack
            direction={'row'}
            alignItems="center"
            justifyContent={'space-between'}
          >
            <Typography
              variant="subtitle2"
              color={theme.text.secondary}
              sx={{ opacity: 0.7 }}
              textTransform="uppercase"
            >
              {item.dat.extension}
            </Typography>
            {writePerms && <ContextMenu id={item.id} listItems={listItems} />}
          </Stack>
        </Grid>
        <Divider />
      </Grid>
    </Box>
  );
};
