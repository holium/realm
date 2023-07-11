import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { theme } from '../theme';
export const CustomButton = styled(Button)({
  boxShadow: 'none',
  textTransform: 'capitalize',
  fontSize: theme.typography.subtitle2,
  fontWeight: 600,
  padding: '8px 7px',
  border: '1px solid',
  borderRadius: '6px',
  lineHeight: '16px',
  //color: "rgba(51, 51, 51, 0.4)",
  backgroundColor: theme.primary,
  borderWidth: 0,
  '&:hover': {
    // backgroundColor: "#0069d9",
    //borderColor: "#0062cc",
    backgroundColor: theme.primary,
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: theme.primary,

    //backgroundColor: "#0062cc",
    // borderColor: "#005cbf",
  },
  '&:focus': {
    //boxShadow: "0 0 0 0.2rem rgba(0,123,255,.5)",
  },
});
