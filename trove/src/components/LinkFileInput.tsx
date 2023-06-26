//custom text field with a button inside the same container
import { useRef, useState } from 'react';
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
import mime from 'mime';

import { getFileMetadata, isValidUrl, log } from '../helpers';
import { useStorage } from '../hooks';
import { addFileAction } from '../store/troveActions';
import { theme } from '../theme';
import { displayDate } from '../time';

const CircularIndeterminate = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress size={16} />
    </Box>
  );
};
const CustomTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    padding: '6px 8px',
    backgroundColor: 'var(--rlm-card-rgba)',
    fontSize: '12px',
    lineHeight: '17px',
    color: theme.text.primary,
  },
  '& input': {
    padding: '0',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'var(--rlm-border-rgba,rgba(227, 227, 227, 0.7))',
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

export const LinkFileInput = ({ closeInput }: any) => {
  const { canUpload, uploadDefault } = useStorage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [addingFile, setAddingFile] = useState<boolean>(false);
  const [uri, setUri] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [metadata, setMetadata] = useState<any>(null);
  const [file, setFile] = useState<null | File>(null);
  const [error, setError] = useState<string>('');

  const clearComponent = () => {
    //reset of the moving parts of this component
    setFile(null);
    setMetadata(null);
    setUri('');
    setTitle('');
    closeInput();
  };
  const downloadLink = () => {
    setError('');
    //downloads link and produces a file form the blob data
    if (!isValidUrl(uri)) {
      setError('Enter a valid link');
      return;
    }
    fetch(uri, {
      method: 'GET',
    })
      .then((response) => response.blob())
      .then((blob) => {
        const extension: any = uri?.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
        const mimeType: any = mime.getType(extension);
        const filename: any = uri
          ?.split('/')
          ?.pop()
          ?.split('#')[0]
          ?.split('?')[0];
        if (!filename || !extension) {
          setError('Could not fetch that file');
          throw new Error('Could not fetch that file');
        }
        const file = new File([blob], filename, {
          type: mimeType,
          lastModified: new Date().getTime(),
        });
        if (file) {
          //we set metadata and display it for the user, he can change the title
          const metadata = getFileMetadata(file);

          setTitle(metadata.title);
          setMetadata(metadata);
          setFile(file);
        }
      })
      .catch((e) => {
        log('error =>', e);
        setError('Could not fetch that file');
      });
  };

  const uploadFile = async () => {
    setAddingFile(true);
    setError('');
    try {
      if (!canUpload) throw Error('can not upload file');
      if (!containerRef.current) throw Error('can not upload file');
      if (!file) throw Error('no file found');

      const uploadMetadata = { ...metadata, title };
      const newMetadata = await uploadDefault(file, uploadMetadata); //same as the previous metadata with an added url for trove agent

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
                placeholder="enter a title"
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
                        uploadFile();
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
            <CustomTextField
              fullWidth
              placeholder="Enter a uri"
              value={uri}
              onChange={(event: any) => {
                setUri(event.target.value);
              }}
            />
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
                  downloadLink();
                }}
              >
                Link
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
