import { FC, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { darken, lighten } from 'polished';

import { Flex, Box, Text, Icons, TextButton } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import {
  getBaseTheme,
  getTransactions,
} from '../../../lib/helpers';
import { TransactionList } from '../Transaction/List';
import { SendTransaction } from '../Transaction/Send';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletView } from 'os/services/tray/wallet.model';

const nfts = [
  {
    title: 'Stem',
    lastPrice: '15.58 ETH',
    image: 'https://pbs.twimg.com/media/EuPi1V7XAAA_k7X?format=jpg&name=medium'
  },
  {
    title: '~CLXXIV – VOYAGES 2',
    tokenType: 'Tomb',
    floorPrice: '4.67 ETH',
    image: 'https://f8n-production-collection-assets.imgix.net/0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405/133004/nft.png?q=80&auto=format%2Ccompress&cs=srgb&max-w=1680&max-h=1680'
  }
]


export const NFTList: FC = (props) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const NFT = (props: any) => {
    return (
      <Flex p={2} width="100%" my="2px" px={3} py={2} alignItems="center" justifyContent="space-between" backgroundColor={darken(.03, theme.currentTheme.windowColor)} borderRadius="6px">
        <Flex alignItems="center">
          <Flex width="76px" height="76px" borderRadius="4px" justifyContent="center">
            {/* TODO: detect aspect ratio? */}
            <img height="76px" src={props.details.image} />
          </Flex>
          <Flex ml={4} flexDirection="column" justifyContent="space-evenly" alignItems="flex-start">
            <Flex flexDirection="column" justifyContent="center">
              <Text variant="body" fontSize={1} color={baseTheme.colors.text.secondary}>{ props.details.floorPrice ? props.details.tokenType : 'Title'}</Text>
              <Text variant="h5" fontSize={1}>{props.details.title}</Text>
            </Flex>
            <Flex mt={1} flexDirection="column" justifyContent="center">
              <Text variant="body" fontSize={1} color={baseTheme.colors.text.secondary}>{ props.details.floorPrice ? 'Floor price' : 'Last price'}</Text>
              <Text variant="h5" fontSize={1}>{ props.details.floorPrice || props.details.lastPrice }</Text>
            </Flex>
          </Flex>
        </Flex>
        <Icons name="ChevronRight" color={theme.currentTheme.iconColor} height={20} />
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center">
      {nfts.map((nft, index) => <NFT details={nft} key={index} />)}
    </Flex>
  )
}
