import styled from 'styled-components';
import { Flex, Text, Icons, Box } from 'renderer/components';

const sizes = {
  sm: 32,
  md: 48,
  lg: 120,
  xl: 148,
  xxl: 210,
};

const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 20,
};

const scales = {
  sm: 0.07,
  md: 0.05,
  lg: 0.07,
  xl: 0.05,
  xxl: 0.02,
};

interface TileStyleProps {}
const TileStyle = styled(Box)<TileStyleProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  img {
    --webkit-user-select: none;
    --khtml-user-select: none;
    --moz-user-select: none;
    --o-user-select: none;
    user-select: none;
  }
`;

export const AppRow = ({ app }) => (
  <Flex flexDirection="row" alignItems="center" gap={8}>
    <TileStyle
      onContextMenu={(evt: any) => {
        evt.stopPropagation();
      }}
      minWidth={sizes.sm}
      style={{
        borderRadius: radius.sm,
        overflow: 'hidden',
      }}
      height={sizes.sm}
      width={sizes.sm}
      backgroundColor={app.color || '#F2F3EF'}
    >
      {app.image && (
        <img
          style={{ pointerEvents: 'none' }}
          draggable="false"
          height={sizes.sm}
          width={sizes.sm}
          key={app.title}
          src={app.image}
        />
      )}
      {app.icon && <Icons name={app.icon} height={16} width={16} />}
    </TileStyle>
    <Flex flexDirection="column">
      <Text fontWeight={500}>{app.title}</Text>
      <Text color={'#888888'}>{app.info}</Text>
    </Flex>
  </Flex>
);
