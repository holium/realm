import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Folder, FolderInput, WrappedBackground } from '../components';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { theme } from '../theme';
export const Aside = () => {
  const [displayMySpaceInput, setDisplayMySpaceInput] =
    useState<boolean>(false);
  const [displayCurrentSpaceInput, setDisplayCurrentSpaceInput] =
    useState<boolean>(false);
  const api = useTroveStore((store: TroveStore) => store.api);
  const selectedFolder = useTroveStore(
    (store: TroveStore) => store.selectedTopLevelFolder
  );
  const setSelectedNode = useTroveStore(
    (store: TroveStore) => store.setSelectedNode
  );
  const topLevelFolders = useTroveStore(
    (store: TroveStore) => store.topLevelFolders
  );
  const inPersonalSpace = useTroveStore(
    (store: TroveStore) => store.inPersonalSpace
  );
  const mySpace = useTroveStore((store: TroveStore) => store.mySpace);
  useEffect(() => {
    if (selectedFolder !== null) {
      setSelectedNode(null);
    }
  }, [selectedFolder]);
  const space = useTroveStore((store: TroveStore) => store.space);
  const newFolder = async (name: string, perms: any, space: string) => {
    try {
      const response = await api.addTrove(space, name, perms);
      console.log('response', response);
    } catch (e) {
      console.log('e', e);
    }
  };
  const [myTroves, setMyTroves] = useState<any>([]);
  const [otherTroves, setOtherTroves] = useState<any>([]);

  useEffect(() => {
    //we group into our troves/not our troves
    const myTroves: any = [];
    const otherTroves: any = [];
    topLevelFolders.forEach((item: any) => {
      const mySpaceTrove = mySpace === item.space;

      if (mySpaceTrove) {
        myTroves.push(item);
      } else {
        otherTroves.push(item);
      }
    });
    setMyTroves(myTroves);
    setOtherTroves(otherTroves);
  }, [topLevelFolders]);
  const renderTroveSectionHeader = (title: string, onAddClick: () => void) => {
    return (
      <Stack
        direction="row"
        justifyContent={'center'}
        alignItems="center"
        marginBottom={'4px'}
      >
        <Typography
          fontSize={'11px'}
          color={theme.text.primary}
          sx={{ opacity: 0.4 }}
          fontWeight="bold"
        >
          {title}
        </Typography>
        <div
          style={{
            flex: 1,
            height: '1.2px',
            backgroundColor: theme.text.primary,
            opacity: '.1',
            margin: '0 8px',
          }}
        ></div>
        <IconButton
          aria-label="add top level folder"
          sx={{
            borderRadius: '4px',
            backgroundColor: `rgba(var(--rlm-brand-rgba), .09)`,
            '&:hover': {
              backgroundColor: `rgba(var(--rlm-brand-rgba), .09)`,
            },
            padding: '2px',
          }}
          onClick={() => {
            onAddClick();
          }}
        >
          <AddIcon style={{ fontSize: 16 }} htmlColor={theme.primary} />
        </IconButton>
      </Stack>
    );
  };
  const renderNoSpaceTrovesMessage = () => {
    if (otherTroves?.length === 0 && !displayCurrentSpaceInput) {
      return (
        <Stack height={'120px'} direction="column" justifyContent="center">
          <Typography
            variant="subtitle2"
            color={theme.text.primary}
            sx={{ opacity: 0.3 }}
            textAlign={'center'}
          >
            Add a folder by clicking the{' '}
            <Typography
              variant="subtitle2"
              color={theme.text.primary}
              fontWeight="bold"
              display={'inline-block'}
            >
              +
            </Typography>
          </Typography>
        </Stack>
      );
    }
    return null;
  };
  const renderEmptyMyFoldersMessage = () => {
    if (myTroves?.length === 0 && !displayMySpaceInput) {
      return (
        <Stack
          paddingTop="35px"
          paddingBottom="35px"
          direction="column"
          justifyContent="center"
        >
          <Typography
            variant="subtitle2"
            color={theme.text.primary}
            sx={{ opacity: 0.3 }}
            textAlign={'center'}
          >
            This is your personal trove
          </Typography>
        </Stack>
      );
    }
    return null;
  };
  const renderCurrentSpaceSection = () => {
    return (
      <Box>
        {renderTroveSectionHeader(space?.split('/')[1], () => {
          setDisplayCurrentSpaceInput(!displayCurrentSpaceInput);
        })}
        {renderNoSpaceTrovesMessage()}
        {displayCurrentSpaceInput && (
          <FolderInput
            handleSubmit={newFolder}
            closeInput={setDisplayCurrentSpaceInput}
            groupSpace={space}
          />
        )}
        {otherTroves.map((item: any, index: number) => {
          const { title, trove, isPrivate, perms } = item;
          return (
            <Folder
              key={'top-level-folder-item-' + index}
              path={title}
              title={title}
              trove={trove}
              trovePerms={perms}
              isPrivate={isPrivate}
              selectedFolder={selectedFolder}
              groupSpace={space}
            />
          );
        })}
      </Box>
    );
  };
  const renderMySpaceSection = () => {
    return (
      <Box>
        {renderTroveSectionHeader('My Folders', () => {
          setDisplayMySpaceInput(!displayMySpaceInput);
        })}
        {renderEmptyMyFoldersMessage()}
        {displayMySpaceInput && (
          <FolderInput
            handleSubmit={newFolder}
            closeInput={setDisplayMySpaceInput}
            groupSpace={mySpace}
          />
        )}
        {myTroves.map((item: any, index: number) => {
          const { title, trove, isPrivate, perms } = item;
          return (
            <Folder
              key={'top-level-folder-item-' + index}
              path={title}
              title={title}
              trove={trove}
              trovePerms={perms}
              isPrivate={isPrivate}
              selectedFolder={selectedFolder}
              groupSpace={mySpace}
            />
          );
        })}
      </Box>
    );
  };
  return (
    <Box width={'20%'} height="100%">
      <WrappedBackground
        styles={{
          height: 'calc(100% - 53px)',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          padding: 0,
          paddingTop: '12px',
          paddingLeft: '12px',
          paddingBottom: '0px',
        }}
      >
        <Stack sx={{ height: '100%' }} spacing={1}>
          <Stack
            sx={{ height: '100%' }}
            justifyContent="space-between"
            spacing={1}
          >
            {!inPersonalSpace && renderCurrentSpaceSection()}
            {renderMySpaceSection()}
          </Stack>
        </Stack>
      </WrappedBackground>
    </Box>
  );
};
