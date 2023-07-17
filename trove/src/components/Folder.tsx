import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  ContextMenu,
  CustomButton,
  CustomTextField,
  TrovePermissions,
} from '../components';
import { getCleanedPerms } from '../helpers';
import {
  editTroveAction,
  removeTroveAction,
  repermTroveAction,
} from '../store/troveActions';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { theme } from '../theme'; //TODO: padding around element here
export const Folder = ({
  title,
  trove,
  isPrivate,
  selectedFolder,
  trovePerms,
  groupSpace,
}: any) => {
  const setSelectedTopLevelFolder = useTroveStore(
    (store: TroveStore) => store.setSelectedTopLevelFolder
  );
  const setSelectedNode = useTroveStore(
    (store: TroveStore) => store.setSelectedNode
  );
  const [perms, setPerms] = useState<any>({
    admin: 'read',
    member: 'read',
    custom: [],
  });
  useEffect(() => {
    //we build our perms object for the trove permission component here
    const newCustom = [];
    for (const cus in trovePerms.custom) {
      newCustom.push({
        ship: cus,
        perm: trovePerms.custom[cus] === 'rw' ? 'readWrite' : 'read',
      });
    }
    let member;
    if (trovePerms.member === null) {
      member = 'private';
    } else if (trovePerms.member === 'rw') {
      member = 'readWrite';
    } else {
      member = 'read';
    }
    const newPerms: any = {
      admin: trovePerms.admins === 'rw' ? 'readWrite' : 'read',
      member,
      custom: newCustom,
    };
    setPerms(newPerms);
  }, [trovePerms]);
  const [isEditingPerms, setIsEditingPerms] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleUpdatePerms = () => {
    ///call api
    const cleanedPerms = getCleanedPerms(perms);
    repermTroveAction(trove, cleanedPerms);
    setIsEditingPerms(false);
  };
  const myPerms = useTroveStore((store: TroveStore) => store.myPerms);

  const setCurrentSpace = useTroveStore(
    (store: TroveStore) => store.setCurrentSpace
  );

  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(event.target.value);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //submit input
    if (event.key === 'Enter') {
      //validate a top level folder or a trove
      if (newTitle.includes('/')) {
        //entered value contains "/", is not useable
        setError('Folder name should not include "/"');
        return;
      }
      editTroveAction(newTitle, trove);
      onDone();
      event.preventDefault();
    }
    //close the input
    if (event.key === 'Escape') {
      onDone();
    }
  };

  const onDone = () => {
    setIsEditingTitle(false);
    setNewTitle('');
  };
  const contextMenuAdmin = [
    {
      onClick: () => {
        removeTroveAction(trove);
        //unselected folder we just deleted
        setSelectedTopLevelFolder(null);
        setSelectedNode(null);
      },
      title: 'Delete folder',
    },
  ];
  const contextMenuOwner = [
    {
      onClick: () => {
        setIsEditingTitle(true);
        setNewTitle(title);
      },
      title: 'Edit title',
    },
    {
      onClick: () => {
        setIsEditingPerms(true);
        //load in my perms
      },
      title: 'Edit perms',
    },
    {
      onClick: () => {
        removeTroveAction(trove);
        //unselected folder we just deleted
        setSelectedTopLevelFolder(null);
        setSelectedNode(null);
        setIsEditingPerms(false);
      },
      title: 'Delete folder',
    },
  ];
  const renderContextMenu = () => {
    if (!myPerms) return;
    if (myPerms[trove]?.isOwner)
      return <ContextMenu listItems={contextMenuOwner} />;
    else if (myPerms[trove]?.isAdmin)
      return <ContextMenu listItems={contextMenuAdmin} />;
    else return;
  };
  return (
    <Box
      sx={{
        backgroundColor: isEditingPerms
          ? theme.background.secondary
          : 'transparent',
        borderRadius: isEditingPerms ? '6px' : '0px',
        '&:hover': {
          backgroundColor: !isEditingPerms ? theme.background.hover : 'none',
        },
      }}
    >
      {!isEditingTitle && (
        <Stack
          direction={'row'}
          alignItems="center"
          justifyContent={'space-between'}
          height={'26px'}
          sx={{
            cursor: 'pointer',
            backgroundColor:
              selectedFolder === trove
                ? theme.background.active
                : 'transparent',
            borderRadius: '6px',
          }}
          padding={'5px'}
          onClick={() => {
            setCurrentSpace(groupSpace);
            setSelectedTopLevelFolder(trove);
          }}
          //ok with height and box-sizing (one where it's all included in height) is more predictable as in, I know exactly how it's spaced
        >
          <Stack direction={'row'} alignItems="center" spacing={1}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_6914_17210)">
                <path
                  d="M12.8333 4.66667V11.6667C12.8333 11.8214 12.7718 11.9697 12.6624 12.0791C12.553 12.1885 12.4047 12.25 12.25 12.25H1.74996C1.59525 12.25 1.44688 12.1885 1.33748 12.0791C1.22808 11.9697 1.16663 11.8214 1.16663 11.6667V4.08333H12.25C12.4047 4.08333 12.553 4.14479 12.6624 4.25419C12.7718 4.36358 12.8333 4.51196 12.8333 4.66667ZM7.24146 2.91667H1.16663V2.33333C1.16663 2.17862 1.22808 2.03025 1.33748 1.92085C1.44688 1.81146 1.59525 1.75 1.74996 1.75H6.07479L7.24146 2.91667Z"
                  fill={theme.icon.primary}
                />
              </g>
              <defs>
                <clipPath id="clip0_6914_17210">
                  <rect width="14" height="14" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <Typography variant="subtitle2" color={theme.text.primary}>
              {title}
            </Typography>
            {isPrivate && (
              <Typography
                variant="subtitle2"
                color={theme.text.secondary}
                sx={{ opacity: 0.7 }}
              >
                (Private)
              </Typography>
            )}
          </Stack>

          {renderContextMenu()}
        </Stack>
      )}
      {isEditingTitle && (
        <Stack
          direction={'row'}
          alignItems="flex-start"
          spacing={1}
          flex={1}
          marginLeft="5px"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginTop: '7px' }}
          >
            <g clipPath="url(#clip0_6914_17210)">
              <path
                d="M12.8333 4.66667V11.6667C12.8333 11.8214 12.7718 11.9697 12.6624 12.0791C12.553 12.1885 12.4047 12.25 12.25 12.25H1.74996C1.59525 12.25 1.44688 12.1885 1.33748 12.0791C1.22808 11.9697 1.16663 11.8214 1.16663 11.6667V4.08333H12.25C12.4047 4.08333 12.553 4.14479 12.6624 4.25419C12.7718 4.36358 12.8333 4.51196 12.8333 4.66667ZM7.24146 2.91667H1.16663V2.33333C1.16663 2.17862 1.22808 2.03025 1.33748 1.92085C1.44688 1.81146 1.59525 1.75 1.74996 1.75H6.07479L7.24146 2.91667Z"
                fill={theme.icon.primary}
              />
            </g>
            <defs>
              <clipPath id="clip0_6914_17210">
                <rect width="14" height="14" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <CustomTextField
            fullWidth
            value={newTitle}
            placeholder="Folder name"
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            autoFocus
            error={error?.length > 0}
            helperText={error}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: theme.typography.subtitle2,
                backgroundColor: theme.background.primary,
              },
            }}
          />
        </Stack>
      )}
      {isEditingPerms && (
        <>
          <TrovePermissions onPermsChange={setPerms} perms={perms} />

          <Stack
            direction="row"
            justifyContent={'flex-end'}
            sx={{ padding: '0px 10px 6px 16px' }}
          >
            <Button
              sx={{
                fontSize: theme.typography.subtitle2,
                color: theme.text.primary,
                opacity: 0.7,
                fontWeight: 'bold',
                height: '24px',
              }}
              size="small"
              onClick={() => setIsEditingPerms(false)}
            >
              <Typography
                variant="subtitle2"
                color={theme.text.primary}
                sx={{ opacity: 0.7 }}
                fontWeight={'bold'}
                textTransform="capitalize"
              >
                Cancel
              </Typography>
            </Button>
            <CustomButton
              fullWidth
              sx={{
                fontSize: theme.typography.subtitle2,
                backgroundColor: theme.primary,
                color: theme.background.primary,
                fontWeight: '500',
                height: '24px',
                '&:hover': {
                  backgroundColor: theme.primary,
                },
              }}
              onClick={handleUpdatePerms}
            >
              Save
            </CustomButton>
          </Stack>
        </>
      )}
    </Box>
  );
};
