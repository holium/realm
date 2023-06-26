import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { isValidPatp } from 'urbit-ob'; // TODO: install this (peerdep?)

import { theme } from '../theme';
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
//TODO: padding around element here
export const TrovePermissions = ({ onPermsChange, perms }: any) => {
  const handleAdminPermChange = (event: any) => {
    const newPerms = { ...perms, admin: event.target.value };
    onPermsChange(newPerms);
  };

  const handleMemberPermChange = (event: any) => {
    const newPerms = { ...perms, member: event.target.value };
    onPermsChange(newPerms);
  };
  const [customShipInput, setCustomShipInput] = useState<string>('');
  const addCustomShip = () => {
    //TODO: add patp validation
    if (!customShipInput) return; //no value, do nothing
    const isValid = isValidPatp(customShipInput);
    if (!isValid) return; //not a valid ship, do nothing

    const newCustomShips: any = [...perms.custom];
    newCustomShips.push({
      ship: customShipInput,
      perm: 'readWrite',
    });

    const newPerms = { ...perms, custom: newCustomShips };
    onPermsChange(newPerms);
    setCustomShipInput('');
  };
  const removeCustomShip = (deletedShip: string) => {
    const newCustomShips: any = [...perms.custom].filter(
      (item: any) => item.ship !== deletedShip
    );

    const newPerms = { ...perms, custom: newCustomShips };
    onPermsChange(newPerms);
  };

  const handleCustomShipPermChange = (newPerm: string, ship: string) => {
    const newCustomShips: any = [...perms.custom].map((item: any) => {
      if (item.ship === ship) {
        return { ...item, perm: newPerm };
      }
      return item;
    });
    const newPerms = { ...perms, custom: newCustomShips };
    onPermsChange(newPerms);
  };

  return (
    <Box padding="6px" paddingLeft="28px">
      <Stack direction={'row'} justifyContent="flex-start">
        <FormControl sx={{ maxWidth: '90px' }}>
          <FormLabel
            sx={{
              color: theme.text.primary,
              fontWeight: 'bold',
              fontSize: theme.typography.body1,
              marginBottom: '5px',
            }}
            id="admin-perms-radio-group"
          >
            ADMINS
          </FormLabel>
          <RadioGroup
            aria-labelledby="admin-perms-radio-group"
            defaultValue="read"
            name="radio-buttons-group-admins-perms"
            row
            value={perms.admin}
            onChange={handleAdminPermChange}
          >
            <FormControlLabel
              value="read"
              sx={{ height: '20px' }}
              control={
                <Radio
                  size={'small'}
                  sx={{
                    color: theme.text.primary,
                    opacity: perms.admin === 'read' ? 1 : 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '13px',
                    },
                    marginRight: '-5px',
                    marginTop: '-3px',
                  }}
                />
              }
              label={
                <Typography
                  fontSize={theme.typography.radioButton}
                  color={theme.text.primary}
                  sx={{ opacity: 0.7 }}
                >
                  Read
                </Typography>
              }
            />
            <FormControlLabel
              value="readWrite"
              sx={{ height: '20px' }}
              control={
                <Radio
                  size={'small'}
                  sx={{
                    color: theme.text.primary,
                    opacity: perms.admin === 'readWrite' ? 1 : 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '13px',
                    },
                    marginRight: '-5px',
                    marginTop: '-3px',
                  }}
                />
              }
              label={
                <Typography
                  fontSize={theme.typography.radioButton}
                  color={theme.text.primary}
                  sx={{ opacity: 0.7 }}
                >
                  Read/Write
                </Typography>
              }
            />
          </RadioGroup>
        </FormControl>
        <FormControl sx={{ maxWidth: '90px' }}>
          <FormLabel
            sx={{
              color: theme.text.primary,
              fontWeight: 'bold',
              fontSize: theme.typography.body1,
              marginBottom: '5px',
            }}
            id="member-perms-radio-group"
          >
            MEMBERS
          </FormLabel>
          <RadioGroup
            aria-labelledby="member-perms-radio-group"
            name="radio-buttons-group-member-perms"
            row
            value={perms.member}
            onChange={handleMemberPermChange}
          >
            <FormControlLabel
              value="read"
              sx={{ height: '20px' }}
              control={
                <Radio
                  size={'small'}
                  sx={{
                    color: theme.text.primary,
                    opacity: perms.member === 'read' ? 1 : 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '13px',
                      marginRight: '-5px',
                      marginTop: '-3px',
                    },
                  }}
                />
              }
              label={
                <Typography
                  fontSize={theme.typography.radioButton}
                  color={theme.text.primary}
                  sx={{ opacity: 0.7 }}
                >
                  Read
                </Typography>
              }
            />
            <FormControlLabel
              value="readWrite"
              sx={{ height: '20px' }}
              control={
                <Radio
                  size={'small'}
                  sx={{
                    color: theme.text.primary,
                    opacity: perms.member === 'readWrite' ? 1 : 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '13px',
                    },
                    marginRight: '-5px',
                    marginTop: '-3px',
                  }}
                />
              }
              label={
                <Typography
                  fontSize={theme.typography.radioButton}
                  color={theme.text.primary}
                  sx={{ opacity: 0.7 }}
                >
                  Read/Write
                </Typography>
              }
            />
            <FormControlLabel
              value="private"
              sx={{ height: '20px' }}
              control={
                <Radio
                  size={'small'}
                  sx={{
                    color: theme.text.primary,
                    opacity: perms.member === 'private' ? 1 : 0.7,
                    '& .MuiSvgIcon-root': {
                      fontSize: '13px',
                    },
                    marginRight: '-5px',
                    marginTop: '-3px',
                  }}
                />
              }
              label={
                <Typography
                  fontSize={theme.typography.radioButton}
                  color={theme.text.primary}
                  sx={{ opacity: 0.7 }}
                >
                  Private
                </Typography>
              }
            />
          </RadioGroup>
        </FormControl>
      </Stack>
      <Stack direction={'column'} marginTop={'8px'}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color={theme.text.primary}
        >
          Custom Permissions
        </Typography>
        <Stack
          direction="row"
          sx={{
            border:
              '1px solid rgba(var(--rlm-border-rgba,rgba(227, 227, 227, 0.7)))',
            borderRadius: '4px',
          }}
        >
          <CustomTextField
            fullWidth
            placeholder="~lomder-librun"
            value={customShipInput}
            onChange={(e: any) => setCustomShipInput(e.target.value)}
            sx={{
              borderWidth: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />
          <IconButton
            aria-label="add custom ship"
            sx={{
              backgroundColor: theme.background.primary,
              padding: '5.33px',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: theme.background.primary,
              },
            }}
            onClick={() => {
              //setDisplayInput(true);
              addCustomShip();
            }}
          >
            <AddIcon style={{ fontSize: 16 }} htmlColor={theme.icon.primary} />
          </IconButton>
        </Stack>
      </Stack>
      <Stack>
        {perms.custom.map((item: any, index: number) => {
          return (
            <FormControl key={'custom-ship-' + index}>
              <Stack>
                <Stack
                  direction={'row'}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <FormLabel
                    id="custom-ship-radio-group"
                    sx={{
                      color: theme.text.primary,
                      fontWeight: 'bold',
                      fontSize: theme.typography.subtitle2,
                      marginBottom: '5px',
                      opacity: 0.7,
                    }}
                  >
                    {item.ship}
                  </FormLabel>
                  <IconButton
                    aria-label="remove custom ship"
                    onClick={() => {
                      removeCustomShip(item.ship);
                    }}
                  >
                    <DeleteIcon
                      style={{ fontSize: 16 }}
                      htmlColor={theme.icon.primary}
                    />
                  </IconButton>
                </Stack>
                <RadioGroup
                  aria-labelledby="custom-ship-radio-group"
                  name="radio-buttons-group-custom-ships"
                  value={item.perm}
                  onChange={(e: any) =>
                    handleCustomShipPermChange(e.target.value, item.ship)
                  }
                  row
                >
                  <FormControlLabel
                    value="read"
                    sx={{ height: '20px' }}
                    control={
                      <Radio
                        size={'small'}
                        sx={{
                          color: theme.text.primary,
                          opacity: item.perm === 'read' ? 1 : 0.7,

                          '& .MuiSvgIcon-root': {
                            fontSize: '13px',
                          },

                          marginRight: '-5px',
                          marginTop: '-3px',
                        }}
                      />
                    }
                    label={
                      <Typography
                        fontSize={theme.typography.radioButton}
                        color={theme.text.primary}
                        sx={{ opacity: 0.7 }}
                      >
                        Read
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="readWrite"
                    sx={{ height: '20px' }}
                    control={
                      <Radio
                        size={'small'}
                        sx={{
                          color: theme.text.primary,
                          opacity: item.perm === 'readWrite' ? 1 : 0.7,
                          '& .MuiSvgIcon-root': {
                            fontSize: '13px',
                          },

                          marginRight: '-5px',
                          marginTop: '-3px',
                        }}
                      />
                    }
                    label={
                      <Typography
                        fontSize={theme.typography.radioButton}
                        color={theme.text.primary}
                        sx={{ opacity: 0.7 }}
                      >
                        Read/Write
                      </Typography>
                    }
                  />
                </RadioGroup>
              </Stack>
            </FormControl>
          );
        })}
      </Stack>
    </Box>
  );
};
