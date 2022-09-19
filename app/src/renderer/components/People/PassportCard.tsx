import { FC } from 'react';
import { rgba, darken } from 'polished';
import { Sigil, Flex, Box, Text, Icons } from '../';
import { PassportButton } from './PassportButton';

interface IPassport {
  patp: string;
  sigilColor?: string;
  avatar?: string;
  nickname?: string;
  description?: string;
  theme?: {
    textColor: string;
    windowColor: string;
  };
}

export const PassportCard: FC<IPassport> = (props: IPassport) => {
  const { patp, sigilColor, avatar, nickname, description } = props;
  const { textColor, windowColor } = props.theme!;
  const iconColor = rgba(textColor, 0.7);
  console.log(textColor);
  const buttonColor = darken(0.1, windowColor);
  return (
    <Flex flexDirection="column" gap={14}>
      <Flex flexDirection="row" gap={12} alignItems="center">
        <Box>
          <Sigil
            simple={false}
            size={52}
            avatar={avatar}
            patp={patp}
            color={[sigilColor || '#000000', 'white']}
            borderRadiusOverride="6px"
          />
        </Box>
        <Flex flexDirection="column" gap={4}>
          {nickname ? (
            <>
              <Text fontWeight={500} fontSize={3}>
                {nickname.substring(0, 30)} {nickname.length > 31 && '...'}
              </Text>
              <Text fontSize={2} opacity={0.6}>
                {patp}
              </Text>
            </>
          ) : (
            <Text fontWeight={500} fontSize={3}>
              {patp}
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex gap={12} flexDirection="column">
        <Flex flexDirection="row" gap={4}>
          <PassportButton
            style={{ backgroundColor: buttonColor }}
            onClick={(evt: any) => {
              evt.stopPropagation();
            }}
          >
            <Icons name="SendCoins" color={iconColor} size="16px" />
          </PassportButton>
          <PassportButton
            style={{ backgroundColor: buttonColor }}
            onClick={(evt: any) => {
              evt.stopPropagation();
            }}
          >
            <Icons name="StartDM" color={iconColor} size="16px" />
          </PassportButton>
        </Flex>
        {description && (
          <Flex flexDirection="column" gap={4}>
            <Text fontSize={2}>{description}</Text>
          </Flex>
        )}
        {/* <Flex flexDirection="column" gap={4}>
          Mutuals
        </Flex> */}
      </Flex>
    </Flex>
  );
};
