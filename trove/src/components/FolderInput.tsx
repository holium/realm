import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomButton, CustomTextField, TrovePermissions } from '../components';
import { getCleanedPerms, log, matchURLSafe } from '../helpers';
import { theme } from '../theme';
//TODO: padding around element here
export const FolderInput = ({
  handleSubmit,
  closeInput,
  displayPerms = true,
  troveValidation = true,
  groupSpace,
}: any) => {
  const [value, setValue] = useState<string>('');
  const [perms, setPerms] = useState<any>({
    admin: 'readWrite',
    member: 'readWrite',
    custom: [],
  });
  const [error, setError] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  const onSubmit = () => {
    if (value) {
      if (troveValidation) {
        //validate a top level folder or a trove
        if (value.includes('/')) {
          //entered value contains "/", is not useable
          setError('Folder name should not include "/"');
          return;
        }
      } else {
        //validate folders of a trove
        const matches = matchURLSafe(value);
        log('matches', matches);

        if (!matches) {
          //entered value is not path safe
          setError('Make sure the name is in kabab-case');
          return;
        }
      }
      //construct our perms
      const cleanedPerms = getCleanedPerms(perms);
      handleSubmit(value, cleanedPerms, groupSpace);
      onDone();
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //submit input
    if (event.key === 'Enter') {
      onSubmit();
      event.preventDefault();
    }
    //close the input
    if (event.key === 'Escape') {
      onDone();
    }
  };

  const onDone = () => {
    setValue('');
    closeInput();
  };
  return (
    <Stack
      sx={{
        backgroundColor: displayPerms
          ? theme.background.secondary
          : 'transparent',
        borderRadius: '6px',
        marginBottom: '5px',
      }}
    >
      <Stack
        direction={'row'}
        alignItems="center"
        justifyContent={'space-between'}
        padding={'5px'}
        //ok with height and box-sizing (one where it's all included in height) is more predictable as in, I know exactly how it's spaced
      >
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
            value={value}
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
      </Stack>
      {displayPerms && (
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
              onClick={() => onDone()}
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
              }}
              onClick={onSubmit}
            >
              Save
            </CustomButton>
          </Stack>
        </>
      )}
    </Stack>
  );
};
