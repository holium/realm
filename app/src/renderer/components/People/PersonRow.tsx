import { useEffect, useRef } from 'react';
import { clan } from 'urbit-ob';
import { Flex, Box, Sigil, Text, MenuItemProps } from '../';
import { Row } from 'renderer/components/NewRow';
import { useContextMenu } from 'renderer/components/ContextMenu';
import { ThemeType } from '../../logic/theme';
import { usePassportMenu } from './usePassportMenu';

interface IPersonRow {
  listId: string;
  patp: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
  style?: any;
  rowBg: string;
  theme?: ThemeType;
  contextMenuOptions?: MenuItemProps[];
  children?: any;
}

export const PersonRow = ({
  listId,
  patp,
  sigilColor,
  avatar,
  nickname,
  description,
  style,
  rowBg,
  contextMenuOptions,
  children,
}: IPersonRow) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { getOptions, setOptions } = useContextMenu();
  const { menuConfig, setMenuConfig } = usePassportMenu();

  const idClass = clan(patp);
  const id = `${listId}-${patp}`;
  let patpSanitized = patp;
  if (idClass === 'moon') {
    const moonTokens = patpSanitized.split('-');
    patpSanitized = `~${moonTokens[2]}^${moonTokens[3]}`;
  }
  if (idClass === 'comet') {
    // TODO sanitize comet
  }

  useEffect(() => {
    if (
      contextMenuOptions &&
      contextMenuOptions.length &&
      contextMenuOptions !== getOptions(id)
    ) {
      setOptions(id, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, id, setOptions]);

  return (
    <Flex key={id} style={{ position: 'relative', ...style }}>
      <Row
        id={id}
        ref={rowRef}
        onContextMenu={(evt: any) => {
          evt.stopPropagation();
        }}
        style={{ justifyContent: 'space-between' }}
        customBg={rowBg}
        selected={menuConfig?.id === id}
        onClick={(evt) => {
          setMenuConfig({
            id,
            options: {
              patp,
              sigilColor,
              avatar,
              nickname,
              description,
            },
            anchorPoint: {
              x: rowRef.current?.getBoundingClientRect().left || 0,
              y: rowRef.current?.getBoundingClientRect().top || 0,
            },
          });
          evt.stopPropagation();
        }}
      >
        <Flex
          gap={10}
          flexDirection="row"
          alignItems="center"
          flex={1}
          maxWidth="100%"
          style={{ pointerEvents: 'none' }}
        >
          <Box>
            <Sigil
              simple
              size={22}
              avatar={avatar}
              patp={patp}
              color={[sigilColor || '#000000', 'white']}
            />
          </Box>
          <Flex flex={1} height="22px" overflow="hidden" alignItems="center">
            <Text
              fontSize={2}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nickname ? nickname : patp}
            </Text>
          </Flex>
        </Flex>
        {children}
      </Row>
    </Flex>
  );
};
