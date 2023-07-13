import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { WrappedBackground } from '../components';
import { splitLastOccurrence } from '../helpers';
import useTroveStore, { TroveStore } from '../store/troveStore';
import { theme } from '../theme';

export const NavigationHeader = () => {
  const currentSpace = useTroveStore((store: TroveStore) => store.currentSpace);
  const [stlfDisplay, setStflDisplay] = useState<string>('');
  const [pathArray, setPathArray] = useState<any>([]);
  const selectedTopLevelFolder = useTroveStore(
    (store: TroveStore) => store.selectedTopLevelFolder
  );
  const selectedNode = useTroveStore((store: TroveStore) => store.selectedNode);

  useEffect(() => {
    //we want the display name to be the final part of the path
    if (selectedTopLevelFolder) {
      const newDisplayName = splitLastOccurrence(
        selectedTopLevelFolder,
        '/'
      )[1];
      setStflDisplay(newDisplayName);
      setPathArray([]);
    }
  }, [selectedTopLevelFolder]);
  useEffect(() => {
    //we split by "/" to get our a path array to render the different parts
    if (selectedNode && selectedNode.type === 'folder') {
      const parts = selectedNode.id.split('/');
      parts.shift();
      setPathArray(parts);
    } else {
      setPathArray([]);
    }
  }, [selectedNode]);
  return (
    <Box sx={{ height: '37px', margin: '0px 8px' }}>
      <Stack flex={1} height="100%" direction={'row'}>
        <WrappedBackground
          styles={{ flex: 1, padding: '4px', borderRadius: '9px' }}
        >
          <Stack direction={'row'}>
            <NavElement title={currentSpace} />
            {selectedTopLevelFolder && (
              <div
                style={{ height: '20px' }}
                key={'nav-header-item-currentSpace'}
              >
                <NavElement title={'/'} separator />
                <NavElement title={stlfDisplay} />
              </div>
            )}
            {pathArray.map((item: string, index: number) => {
              return (
                <div
                  style={{ height: '20px' }}
                  key={'nav-header-item-' + index}
                >
                  <NavElement title={'/'} separator />
                  <NavElement title={item} />
                </div>
              );
            })}
          </Stack>
        </WrappedBackground>
      </Stack>
    </Box>
  );
};
const NavElement = ({
  title,
  separator = false,
}: {
  title: null | string;
  separator?: boolean;
}) => {
  return (
    <Typography
      variant="subtitle2"
      color={theme.text.secondary}
      sx={{
        backgroundColor: separator ? 'transparent' : theme.background.secondary,
        padding: '4px 6px',
        borderRadius: '6px',
        display: 'inline-block',
        opacity: separator ? 0.2 : 0.7,
      }}
      fontWeight={separator ? 'bold' : 'normal'}
    >
      {title}
    </Typography>
  );
};
