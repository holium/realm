import { FC } from 'react';
import { rgba, lighten, darken } from 'polished';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Grid, Flex, IconButton, Icons, Text } from '../../components';
import { WalletMain } from './components/WalletMain';
import { Titlebar } from 'renderer/system/desktop/components/AppWindow/Titlebar';

type WalletProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Wallet: FC<WalletProps> = (props: WalletProps) => {
  const { dimensions } = props;
  const { windowColor, inputColor, iconColor, textColor } = props.theme;

  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Titlebar
        closeButton={false}
        hasBorder={false}
        theme={{
          ...props.theme,
          windowColor,
        }}
      >
        <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
          <Icons opacity={0.8} name="Wallet" size={24} mr={2} />
          <Text
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            Wallet
          </Text>
        </Flex>

        <Flex
          minHeight={22}
          // minWidth={150}
          style={{
            borderRadius: 5,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: darken(0.025, windowColor!),
            minWidth: 120,
          }}
          pt={1}
          pl={2}
          pb={1}
          pr={2}
          mr={3}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="space-between"
          background={rgba(inputColor, 0.8)}
        >
          <Text
            display="flex"
            width="fit-content"
            justifyContent="center"
            alignItems="center"
            fontSize={3}
            mr={2}
            opacity={0.7}
          >
            <svg
              style={{ marginRight: 10 }}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <rect width="16" height="16" fill="url(#pattern0)" />
              <defs>
                <pattern
                  id="pattern0"
                  patternContentUnits="objectBoundingBox"
                  width="1"
                  height="1"
                >
                  <use
                    xlinkHref="#image0_2594_31508"
                    transform="scale(0.005)"
                  />
                </pattern>
                <image
                  id="image0_2594_31508"
                  width="200"
                  height="200"
                  xlinkHref="data:image/png;base64,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"
                />
              </defs>
            </svg>
            BitcoinSV
          </Text>
          <Icons name="ArrowDown" opacity={0.4} />
        </Flex>
      </Titlebar>

      <Flex
        position="absolute"
        style={{ bottom: 40, top: 50, left: 0, right: 0 }}
        overflowY="hidden"
      >
        <WalletMain theme={props.theme} />
      </Flex>
      <Grid.Row
        expand
        noGutter
        justify="space-between"
        align="center"
        style={{
          background: windowColor,
          // backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${rgba(windowColor!, 0.7)}`,
          position: 'absolute',
          padding: '0 8px',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
        }}
      >
        <Text
          display="flex"
          flexDirection="row"
          alignItems="center"
          ml={2}
          opacity={0.7}
          style={{ cursor: 'pointer' }}
        >
          1JCKfg...u8vJCh
          <IconButton size={26} ml={2} color={iconColor}>
            <Icons name="Copy" />
          </IconButton>
        </Text>
        <Flex>
          <IconButton size={26} mr={2} color={iconColor}>
            <Icons name="QRCode" />
          </IconButton>
          <IconButton size={26} color={iconColor}>
            <Icons name="ShareBox" />
          </IconButton>
        </Flex>
      </Grid.Row>
    </Grid.Column>
  );
};
