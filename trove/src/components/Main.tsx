import { useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {
  FolderInput,
  LinkFileInput,
  RecursiveTree,
  UploadFileInput,
  WrappedBackground,
} from '../components';
import { moveFileAction, moveFolderAction } from '../store/troveActions';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { theme } from '../theme';
export const Main = ({ troveRenderTree, useStorage, uploadFile }: any) => {
  const { canUpload } = useStorage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayFolderInput, setDisplayFolderInput] = useState<boolean>(false);
  const [displayFileInput, setDisplayFileInput] = useState<boolean>(false);
  const [displayFileLink, setDisplayFileLink] = useState<boolean>(false);

  const api = useTroveStore((store: TroveStore) => store.api);

  const myPerms = useTroveStore((store: TroveStore) => store.myPerms);
  const selectedTopLevelFolder = useTroveStore(
    (store: TroveStore) => store.selectedTopLevelFolder
  );

  const selectedNode = useTroveStore((store: TroveStore) => store.selectedNode);
  const setSelectedNode = useTroveStore(
    (store: TroveStore) => store.setSelectedNode
  );
  const space = useTroveStore((store: TroveStore) => store.currentSpace);
  const handleSelection = (data: any = null) => {
    //if we get the same instance twice, we unselect
    setSelectedNode(null);
    if (data?.id === selectedNode?.id) {
      //this block isn't empty
    } else {
      setSelectedNode(data);
    }
  };

  const handleAddFolder = async (name: string) => {
    //if we have a file selected this option should be disabled
    let pathToParent;
    let pathToNewFolder;
    if (!selectedNode) {
      //nothing selected,we add at the top level folder here
      pathToParent = selectedTopLevelFolder;
      //added at root, path to new folder is just the name
      pathToNewFolder = '/' + name;
    } else if (selectedNode.type === 'file') {
      pathToParent = selectedTopLevelFolder;
      //added at root, path to new folder is just the name

      pathToNewFolder = '/' + name;
    } else {
      pathToParent = selectedNode.id;
      //added under a folder, path to new folder is pathToParent + name
      pathToNewFolder = pathToParent + '/' + name;
    }

    try {
      const response = await api.createFolder(
        space,
        selectedTopLevelFolder,
        pathToNewFolder
      );
      console.log('response', response);
    } catch (e) {
      console.log('e', e);
    }
  };
  /*
    
    */
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ['file', 'folder'],
      drop: (data: any) => {
        //path here is the selectedTopLevelFolder
        if (data?.ddType === 'folder') {
          //can not drop a folder on it'self
          if (data.path === selectedTopLevelFolder) return;
          moveFolderAction(data.path, '/');
        } else if (data?.ddType === 'file') {
          moveFileAction(data.id, '/');
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    []
  );
  const getUploadFileColor = () => {
    if (!writePerms) return theme.icon.disabled;
    else if (!canUpload) {
      return theme.error;
    } else if (displayFileInput) {
      return theme.icon.disabled;
    }
    return theme.primary;

    //fill={displayFileLink ? theme.icon.disabled : theme.primary}
  };
  const getFileLinkColor = () => {
    if (!writePerms) return theme.icon.disabled;
    else if (!canUpload) {
      return theme.error;
    }
    return displayFileLink ? theme.icon.disabled : theme.primary;
  };
  const getFolderIconColor = () => {
    if (!writePerms) return theme.icon.disabled;
    return displayFolderInput ? theme.icon.disabled : theme.primary;
  };
  const [writePerms, setWritePerms] = useState<boolean>(false);
  useEffect(() => {
    if (myPerms && selectedTopLevelFolder) {
      const writePerms = myPerms[selectedTopLevelFolder]?.perms;
      if (writePerms) {
        setWritePerms(writePerms === 'rw');
      }
    }
  }, [myPerms, selectedTopLevelFolder]);
  const uploadFileDisabled =
    !writePerms ||
    selectedNode?.type === 'file' ||
    !selectedTopLevelFolder ||
    !canUpload;
  const linkFileDisabled =
    !writePerms ||
    !canUpload ||
    selectedNode?.type === 'file' ||
    !selectedTopLevelFolder;
  const addFolderDisabled =
    !writePerms || selectedNode?.type === 'file' || !selectedTopLevelFolder;
  const renderHeader = () => {
    return (
      <Stack
        direction={'row'}
        alignItems="center"
        justifyContent={'space-between'}
        marginBottom="15px"
      >
        <Stack direction={'row'} spacing={1}>
          <Tooltip title="Upload file">
            <IconButton
              style={{
                padding: 2,
                cursor: 'pointer',
                opacity: uploadFileDisabled ? 0.3 : 1,
              }}
              onClick={(evt: any) => {
                evt.stopPropagation();
                setDisplayFileInput(!displayFileInput);
              }}
              disabled={uploadFileDisabled}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6914_17274)">
                  <path
                    d="M8.00005 8.39059L10.8287 11.2186L9.88538 12.1619L8.66672 10.9433V14.6666H7.33338V10.9419L6.11472 12.1619L5.17138 11.2186L8.00005 8.39059ZM8.00005 1.33325C9.14471 1.33331 10.2494 1.75399 11.1042 2.51533C11.9589 3.27667 12.5041 4.32556 12.6361 5.46259C13.4656 5.6888 14.1892 6.19932 14.6805 6.90494C15.1718 7.61055 15.3995 8.46638 15.3238 9.32285C15.2481 10.1793 14.8738 10.9819 14.2664 11.5905C13.659 12.199 12.857 12.5747 12.0007 12.6519V11.3093C12.3075 11.2654 12.6025 11.161 12.8684 11.0019C13.1344 10.8428 13.366 10.6324 13.5498 10.3829C13.7335 10.1333 13.8657 9.84967 13.9386 9.54848C14.0116 9.24729 14.0238 8.93459 13.9745 8.62863C13.9253 8.32267 13.8156 8.02959 13.6519 7.76649C13.4881 7.50338 13.2736 7.27553 13.0209 7.09623C12.7681 6.91693 12.4822 6.78978 12.1797 6.72219C11.8773 6.65461 11.5644 6.64794 11.2594 6.70259C11.3638 6.21651 11.3581 5.71323 11.2429 5.22962C11.1276 4.74601 10.9056 4.29431 10.5931 3.9076C10.2807 3.5209 9.88565 3.20899 9.43703 2.99472C8.98841 2.78044 8.49755 2.66923 8.00038 2.66923C7.50322 2.66923 7.01235 2.78044 6.56374 2.99472C6.11512 3.20899 5.72011 3.5209 5.40765 3.9076C5.09519 4.29431 4.87319 4.74601 4.75791 5.22962C4.64262 5.71323 4.63698 6.21651 4.74138 6.70259C4.13316 6.58837 3.50446 6.72044 2.99361 7.06976C2.48276 7.41908 2.1316 7.95702 2.01738 8.56525C1.90316 9.17348 2.03524 9.80217 2.38456 10.313C2.73388 10.8239 3.27182 11.175 3.88005 11.2893L4.00005 11.3093V12.6519C3.14368 12.5748 2.34166 12.1992 1.73414 11.5907C1.12663 10.9822 0.752269 10.1796 0.676501 9.32314C0.600732 8.46665 0.828371 7.61077 1.31963 6.9051C1.81089 6.19943 2.53452 5.68884 3.36405 5.46259C3.49586 4.3255 4.04099 3.27653 4.89577 2.51516C5.75055 1.7538 6.85536 1.33316 8.00005 1.33325Z"
                    fill={getUploadFileColor()}
                  />
                </g>
              </svg>
            </IconButton>
          </Tooltip>
          <Tooltip title="Link file">
            <IconButton
              style={{
                padding: 2,
                cursor: 'pointer',
                opacity: linkFileDisabled ? 0.3 : 1,
              }}
              onClick={(evt: any) => {
                evt.stopPropagation();
                setDisplayFileLink(!displayFileLink);
              }}
              disabled={linkFileDisabled}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6914_17276)">
                  <path
                    d="M11.7713 9.88542L10.8287 8.94275L11.7713 8.00008C12.019 7.75245 12.2154 7.45848 12.3494 7.13493C12.4834 6.81139 12.5524 6.46462 12.5524 6.11442C12.5524 5.76422 12.4834 5.41744 12.3494 5.0939C12.2154 4.77036 12.019 4.47638 11.7713 4.22875C11.5237 3.98112 11.2297 3.78469 10.9062 3.65068C10.5826 3.51666 10.2359 3.44768 9.88568 3.44768C9.53547 3.44768 9.1887 3.51666 8.86516 3.65068C8.54162 3.78469 8.24764 3.98112 8.00001 4.22875L7.05734 5.17142L6.11468 4.22875L7.05734 3.28608C7.80955 2.54603 8.82372 2.13319 9.87893 2.13748C10.9341 2.14178 11.9449 2.56287 12.6911 3.30902C13.4372 4.05518 13.8583 5.06595 13.8626 6.12116C13.8669 7.17638 13.4541 8.19054 12.714 8.94275L11.7713 9.88542ZM9.88534 11.7714L8.94268 12.7141C8.57236 13.0905 8.13118 13.3898 7.64459 13.5949C7.15799 13.7999 6.63562 13.9066 6.1076 13.9088C5.57957 13.9109 5.05635 13.8085 4.5681 13.6074C4.07986 13.4063 3.63625 13.1106 3.26288 12.7372C2.88951 12.3638 2.59376 11.9202 2.39268 11.432C2.19161 10.9437 2.08919 10.4205 2.09134 9.8925C2.09349 9.36447 2.20017 8.8421 2.40521 8.35551C2.61025 7.86892 2.90961 7.42774 3.28601 7.05742L4.22868 6.11475L5.17134 7.05742L4.22868 8.00008C3.98105 8.24771 3.78462 8.54169 3.6506 8.86523C3.51658 9.18878 3.44761 9.53555 3.44761 9.88575C3.44761 10.236 3.51658 10.5827 3.6506 10.9063C3.78462 11.2298 3.98105 11.5238 4.22868 11.7714C4.47631 12.019 4.77028 12.2155 5.09383 12.3495C5.41737 12.4835 5.76414 12.5525 6.11434 12.5525C6.46454 12.5525 6.81131 12.4835 7.13486 12.3495C7.4584 12.2155 7.75238 12.019 8.00001 11.7714L8.94268 10.8287L9.88534 11.7714ZM9.88534 5.17142L10.8287 6.11475L6.11468 10.8281L5.17134 9.88542L9.88534 5.17208V5.17142Z"
                    fill={getFileLinkColor()}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6914_17276">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </IconButton>
          </Tooltip>

          <Tooltip title="Add folder">
            <IconButton
              style={{
                padding: 2,
                cursor: 'pointer',
                opacity: addFolderDisabled ? 0.3 : 1,
              }}
              onClick={() => setDisplayFolderInput(!displayFolderInput)}
              disabled={addFolderDisabled}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6914_17278)">
                  <path
                    d="M8.27604 3.33333H14C14.1769 3.33333 14.3464 3.40357 14.4714 3.5286C14.5965 3.65362 14.6667 3.82319 14.6667 4V13.3333C14.6667 13.5101 14.5965 13.6797 14.4714 13.8047C14.3464 13.9298 14.1769 14 14 14H2.00004C1.82323 14 1.65366 13.9298 1.52864 13.8047C1.40361 13.6797 1.33337 13.5101 1.33337 13.3333V2.66667C1.33337 2.48986 1.40361 2.32029 1.52864 2.19526C1.65366 2.07024 1.82323 2 2.00004 2H6.94271L8.27604 3.33333ZM2.66671 3.33333V12.6667H13.3334V4.66667H7.72404L6.39071 3.33333H2.66671ZM7.33337 8V6H8.66671V8H10.6667V9.33333H8.66671V11.3333H7.33337V9.33333H5.33337V8H7.33337Z"
                    fill={getFolderIconColor()}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6914_17278">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack
          direction={'row'}
          alignItems="center"
          spacing={'8px'}
          height="23px"
        >
          {selectedTopLevelFolder && (
            <div
              style={{
                borderRadius: '19px',
                border: `1px solid ${theme.background.secondary}`,
                padding: '2px 8px',
                backgroundColor: theme.window,
              }}
            >
              <Typography
                color={theme.text.primary}
                variant="subtitle2"
                sx={{ opacity: 0.7 }}
              >
                {writePerms ? 'Read/Write' : 'Read'}
              </Typography>
            </div>
          )}

          <DateOrderSelect />
        </Stack>
      </Stack>
    );
  };
  const renderEmptyFolderText = () => {
    if (!selectedTopLevelFolder) {
      return (
        <Typography
          variant="subtitle2"
          color={theme.text.primary}
          sx={{ opacity: 0.5 }}
          textAlign={'center'}
          marginTop={'55px'}
        >
          Select a folder on the left
        </Typography>
      );
    }

    if (
      selectedTopLevelFolder &&
      troveRenderTree[selectedTopLevelFolder] &&
      Object.keys(troveRenderTree[selectedTopLevelFolder]).length === 0
    ) {
      return (
        <Typography
          variant="subtitle2"
          color={theme.text.primary}
          sx={{ opacity: 0.5 }}
          textAlign={'center'}
          marginTop={'55px'}
        >
          This folder is empty
        </Typography>
      );
    }
    return null;
  };
  return (
    <Box width={'80%'}>
      <div ref={containerRef} style={{ display: 'none' }}></div>
      <WrappedBackground
        styles={{
          height: 'calc(100vh - 53px)',
          overflow: 'hidden',
          padding: '10px',
          margin: '8px 8px 8px 8px',
        }}
      >
        {renderHeader()}
        <Grid container>
          <Grid item md={7}>
            <Typography
              variant="body1"
              color={theme.text.secondary}
              sx={{ opacity: 0.7 }}
            >
              Name
            </Typography>
          </Grid>
          <Grid item md={1}>
            <Typography
              variant="body1"
              color={theme.text.secondary}
              sx={{ opacity: 0.7 }}
            >
              Size
            </Typography>
          </Grid>
          <Grid item md={3}>
            <Typography
              variant="body1"
              color={theme.text.secondary}
              sx={{ opacity: 0.7 }}
            >
              Date Uploaded
            </Typography>
          </Grid>
          <Grid item md={1}>
            <Typography
              variant="body1"
              color={theme.text.secondary}
              sx={{ opacity: 0.7 }}
            >
              Kind
            </Typography>
          </Grid>
        </Grid>
        <Divider
          sx={{
            margin: '4px 0',
            backgroundColor: theme.text.primary,
            opacity: '.1',
          }}
        />
        <Stack
          sx={{
            height: '100%',
            paddingBottom: 5,
            position: 'relative',
          }}
        >
          <div style={{ zIndex: 1 }}>
            {displayFileInput && (
              <UploadFileInput
                closeInput={() => setDisplayFileInput(false)}
                useStorage={useStorage}
                uploadFile={uploadFile}
              />
            )}
            {displayFileLink && (
              <LinkFileInput
                closeInput={() => setDisplayFileLink(false)}
                useStorage={useStorage}
                uploadFile={uploadFile}
              />
            )}
            {displayFolderInput && (
              <FolderInput
                handleSubmit={handleAddFolder}
                closeInput={() => setDisplayFolderInput(false)}
                displayPerms={false}
                troveValidation={false}
              />
            )}
            {renderEmptyFolderText()}
            <RecursiveTree
              itemList={
                selectedTopLevelFolder
                  ? troveRenderTree[selectedTopLevelFolder]
                  : []
              }
              handleSelection={handleSelection}
              selected={selectedNode}
              writePerms={writePerms}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: isOver
                ? theme.background.secondary
                : 'transparent',
            }}
            ref={drop}
          ></div>
        </Stack>
      </WrappedBackground>
    </Box>
  );
};
function DateOrderSelect() {
  const dateSorting = useTroveStore((store: TroveStore) => store.dateSorting);
  const setDateSorting = useTroveStore(
    (store: TroveStore) => store.setDateSorting
  );

  const handleChange = (event: SelectChangeEvent) => {
    setDateSorting(event.target.value as string);
  };

  return (
    <Stack direction={'row'} alignItems="center" spacing="8px">
      <Typography
        variant="body1"
        color={theme.text.primary}
        sx={{ opacity: 0.7 }}
        fontWeight="bold"
      >
        Date
      </Typography>
      <FormControl>
        <Select
          MenuProps={{
            sx: {
              '& .MuiMenu-paper': {
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
              },
              '& .MuiMenuItem-root:hover': {
                backgroundColor: theme.background.secondary,
              },
            },
          }}
          sx={{
            color: theme.text.primary,

            '.MuiSvgIcon-root': {
              color: theme.icon.primary,
            },
            //border color related
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: theme.background.secondary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.background.secondary,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.background.secondary,
            },
          }}
          value={dateSorting}
          onChange={handleChange}
          size="small"
        >
          <MenuItem color={theme.text.primary} value={'asc'}>
            ASC
          </MenuItem>
          <MenuItem color={theme.text.primary} value={'dsc'}>
            DSC
          </MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
