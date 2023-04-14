import { useRef } from 'react';
import styled from 'styled-components';
import { Flex, Text, Icon, Box, Row } from '@holium/design-system';
import { DocketAppType } from 'renderer/stores/models/bazaar.model';

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

interface AppRowProps {
  app: any;
  descriptionWidth?: number;
  onClick?: (evt: React.MouseEvent<HTMLElement>, app: DocketAppType) => void;
  actionRenderer?: any;
}

export const AppRow = ({
  descriptionWidth,
  app,
  onClick,
  actionRenderer,
}: AppRowProps) => {
  const rowRef = useRef<any>(null);
  let image = app.image;
  if (app && !app.image && app.href && app.href.site) {
    // for the case an image is served by the ship
    // we wont have it until install, so set to null
    image = null;
  }
  let title = app.title;
  if (app && app.href && !app.title) {
    title = app.id.split('/')[1];
  }

  return (
    <Row id={`app-row-${app.id}`} ref={rowRef} className="realm-cursor-hover">
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="100%"
        flex={1}
        onClick={(evt: React.MouseEvent<HTMLDivElement>) =>
          onClick && onClick(evt, app)
        }
      >
        <Flex
          gap={8}
          alignItems="center"
          flexGrow={0}
          flexDirection="row"
          minWidth={0}
        >
          <TileStyle
            onContextMenu={(evt: any) => {
              evt.stopPropagation();
            }}
            minWidth={sizes.sm}
            style={{
              borderRadius: radius.sm,
              overflow: 'hidden',
              backgroundColor: app.color || '#F2F3EF',
            }}
            height={sizes.sm}
            width={sizes.sm}
          >
            {image && (
              <img
                style={{ pointerEvents: 'none' }}
                draggable="false"
                height={sizes.sm}
                width={sizes.sm}
                src={image}
                alt="app tile icon"
              />
            )}
            {app.icon && <Icon name={app.icon} size={16} />}
          </TileStyle>
          <Flex flexDirection="column" overflow="hidden">
            <Text.Custom
              fontWeight={500}
              fontSize={3}
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '100%',
              }}
            >
              {title}
            </Text.Custom>
            <Text.Custom
              mt="2px"
              style={{
                width: descriptionWidth || 'fit-content',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '100%',
              }}
              fontSize={2}
              opacity={0.4}
            >
              {app.info}
            </Text.Custom>
          </Flex>
        </Flex>
        {actionRenderer && (
          <div style={{ whiteSpace: 'nowrap' }}>{actionRenderer(app)}</div>
        )}
      </Flex>
    </Row>
  );
};
