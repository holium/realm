import { FC } from 'react';
import { rgba, lighten, darken } from 'polished';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Grid, Flex, IconButton, Icons, Text } from '../../components';
import { WalletMain } from './components/WalletMain';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';

type WalletProps = {
  theme: ThemeModelType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const WalletTrayApp: FC<WalletProps> = (props: WalletProps) => {
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
            <img
              style={{ marginRight: 10 }}
              width={16}
              height={16}
              src="https://cdn.decrypt.co/resize/1536/wp-content/uploads/2019/03/bitcoin-logo-bitboy.png.webp"
            />
            Bitcoin
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
