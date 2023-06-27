import { useCallback, useRef, useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { getFileMetadata, log } from '../helpers';
import { addFileAction } from '../store/troveActions';
import { theme } from '../theme';
import { displayDate } from '../time';
interface FileUploadParams {
  source: 'file' | 'buffer';
  // when source='file', content is filename; otherwise
  //   content should be clipboard contents
  content: string;
  contentType: string;
}

function CircularIndeterminate() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress size={16} />
    </Box>
  );
}
const CustomTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    padding: '6px 8px',
    backgroundColor: theme.background.primary,
    fontSize: '12px',
    lineHeight: '17px',
    color: theme.text.primary,
  },
  '& input': {
    padding: '0',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.background.secondary,
      borderWidth: '0',
    },
    '&:hover fieldset': {
      borderColor: 'primary',
      borderWidth: '0',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary',
      borderWidth: '0',
    },
  },
});

export const UploadFileInput = ({
  closeInput,
  useStorage,
  uploadFile,
}: any) => {
  const { canUpload, promptUpload } = useStorage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [addingFile, setAddingFile] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);
  const [file, setFile] = useState<null | any>(null);
  const [error, setError] = useState<string>('');
  const clearComponent = () => {
    //reset of the moving parts of this component
    setFile(null);
    setMetadata(null);
    setTitle('');
    closeInput();
  };
  const browseFile = async () => {
    if (!canUpload) return;
    if (!containerRef.current) return;

    try {
      const file: any = await promptUpload(containerRef.current);

      if (file) {
        //we set metadata and display it for the user, he can change the title
        const metadata = getFileMetadata(file);
        log('metadata', metadata);
        setTitle(metadata.title);
        setMetadata(metadata);
        setFile(file);
      }
    } catch (e) {
      log('error =>', e);
    }
  };
  console.log('uploadFile', uploadFile);

  const uploadFileCb = useCallback(
    (params: FileUploadParams): Promise<{ Location: string; key: string }> => {
      return new Promise((resolve, reject) => {
        uploadFile(params)
          .then((data: any) => {
            resolve(data);
          })
          .catch((e: any) => {
            reject(e);
          })
          .finally(() => log('setIsUploading(false)'));
      });
    },
    []
  );
  const onUploadFile = async () => {
    setAddingFile(true);
    setError('');
    try {
      if (!canUpload) throw Error('can not upload file');
      if (!containerRef.current) throw Error('can not upload file');
      if (!file) throw Error('no file found');

      const uploadMetadata = { ...metadata, title };
      log('uploadMetadata', uploadMetadata);

      const params: FileUploadParams = {
        source: 'file',
        content: file.path,
        contentType: file.type,
      };
      const { Location, key } = await uploadFileCb(params); //same as the previous metadata with an added url for trove agent
      const newMetadata = { ...uploadMetadata, url: Location, key };
      await addFileAction(newMetadata);
      clearComponent();
    } catch (e: any) {
      setError(e.message);
      log('error =>', e);
    }
    setAddingFile(false);
  };
  return (
    <Stack>
      <Stack
        direction="row"
        sx={{
          border: error
            ? `1px solid ${theme.error}`
            : '1px solid rgba(var(--rlm-border-rgba,rgba(227, 227, 227, 0.7)))',
          borderRadius: '4px',
        }}
      >
        <div ref={containerRef} style={{ display: 'none' }}></div>
        {metadata ? (
          <Grid container alignItems={'center'}>
            <Grid item md={7}>
              <CustomTextField
                fullWidth
                placeholder="Select a file"
                value={title}
                onChange={(event: any) => {
                  setTitle(event.target.value);
                }}
              />
            </Grid>
            <Grid item md={1}>
              <Typography
                color={theme.text.primary}
                sx={{ opacity: 0.7 }}
                variant="subtitle2"
              >
                {metadata.size}
              </Typography>
            </Grid>
            <Grid item md={3}>
              <Typography
                color={theme.text.primary}
                sx={{ opacity: 0.7 }}
                variant="subtitle2"
              >
                {displayDate(metadata.timeUploaded, {
                  long: false,
                  dayOnly: false,
                })}
              </Typography>
            </Grid>
            <Grid item md={1}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                justifyContent="space-between"
              >
                <Typography
                  color={theme.text.primary}
                  sx={{ opacity: 0.7 }}
                  variant="subtitle2"
                  textTransform="uppercase"
                >
                  {metadata.extension}
                </Typography>
                <Box margin="0 12px 0 0">
                  {addingFile ? (
                    <CircularIndeterminate />
                  ) : (
                    <IconButton
                      aria-label="done uploading"
                      onClick={() => {
                        onUploadFile();
                      }}
                      size="small"
                    >
                      <CheckCircleOutlineIcon
                        sx={{
                          fontSize: 16,
                          color: theme.icon.primary,
                        }}
                      />
                    </IconButton>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <>
            <CustomTextField fullWidth placeholder="Select a file" />
            {addingFile ? (
              <CircularIndeterminate />
            ) : (
              <Button
                sx={{
                  textTransform: 'capitalize',
                  padding: 0,
                  marginRight: '8px',
                  fontSize: theme.typography.subtitle2,
                }}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  browseFile();
                }}
              >
                Browse
              </Button>
            )}
          </>
        )}
      </Stack>
      <Typography
        sx={{ marginTop: '5px', marginLeft: '5px' }}
        variant="subtitle2"
        color={theme.text.error}
      >
        {error}
      </Typography>
    </Stack>
  );
};
