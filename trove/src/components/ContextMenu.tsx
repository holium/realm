import * as React from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

import { log } from '../helpers';
import { theme } from '../theme';
const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(() => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    minWidth: 120,
    backgroundColor: theme.background.primary,
    border: `1px solid ${theme.background.secondary}`,
    boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.12)',

    '& .MuiMenu-list': {
      padding: '4px 0',
      color: theme.text.primary,
    },
    '& .MuiMenuItem-root': {
      fontSize: theme.typography.subtitle2,
      minHeight: 'auto',

      '&:hover': {
        backgroundColor: theme.background.secondary,
      },

      '&:active': {
        backgroundColor: theme.background.secondary,
      },
    },
  },
}));
export const ContextMenu = ({ listItems, id }: any) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    //intended to stop reselection ( TODO )
    event.stopPropagation();
    event.preventDefault();

    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="word options"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
      >
        <MoreHorizIcon sx={{ fontSize: 14, color: theme.icon.primary }} />
      </IconButton>
      <StyledMenu
        id="word-options-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {listItems.map((item: any, index: number) => {
          return (
            <MenuItem
              onClick={(e: any) => {
                e.stopPropagation(); //intended to stop reselection ( TODO )
                setTimeout(() => {
                  log('after a short delay');
                  item.onClick();
                }, 200);
                handleClose();
              }}
              key={id + '-' + index}
            >
              {item.title}
            </MenuItem>
          );
        })}
      </StyledMenu>
    </div>
  );
};
