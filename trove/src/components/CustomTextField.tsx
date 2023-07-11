import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { theme } from '../theme';
export const CustomTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    padding: '6px 8px',
    backgroundColor: theme.background.primary,
    fontSize: theme.typography.subtitle2,
    lineHeight: '17px', //todo: follows 12px. not the old 14px
    color: theme.text.primary,
  },
  '& input': {
    padding: '0',
  },
  '& .MuiFormHelperText-root': {
    //helper text class
    marginLeft: '6px',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.background.secondary,
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'primary',
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary',
      borderWidth: '1px',
    },
  },
});
