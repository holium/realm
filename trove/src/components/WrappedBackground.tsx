import Paper from '@mui/material/Paper';

import { theme } from '../theme';
export const WrappedBackground = ({ styles, children }: any) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        // margin: "12px 20px",
        backgroundColor: theme.background.primary,
        border: `1px solid ${theme.background.secondary}`,
        borderRadius: '6px',
        boxSizing: 'border-box',
        padding: '16px',
        ...styles,
      }}
    >
      {children}
    </Paper>
  );
};
