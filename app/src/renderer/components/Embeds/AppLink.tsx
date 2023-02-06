import { ReactNode } from 'react';
import { Flex, EmbedBox, Text, Skeleton } from '../index';

interface AppLinkProps {
  loading?: boolean;
  image?: string;
  title: string;
  info: string;
  ship: string;
  version: string;
  color: string;
  bgColor?: string;
  textColor?: string;
  desk?: string;
}

export const AppLink = (props: AppLinkProps) => {
  let innerContent: ReactNode;
  if (props.loading) {
    innerContent = (
      <>
        <Flex alignItems="center" mr={3}>
          <Skeleton style={{ borderRadius: 6 }} height={48} width={48} />
        </Flex>
        <Flex gap={8} flex={1} justifyContent="center" flexDirection="column">
          <Flex justifyContent="space-between">
            <Skeleton height={14} width={150} />
            <Skeleton height={14} width={30} />
          </Flex>
          <Flex justifyContent="space-between">
            <Skeleton height={14} width={120} />
          </Flex>
        </Flex>
      </>
    );
  } else {
    innerContent = (
      <>
        <Flex alignItems="center" mr={3}>
          <img
            alt="App icon"
            style={{
              borderRadius: 6,
              // border: props.color
              //   ? `1px solid ${rgba(darken(0.4, props.color), 0.1)}`
              //   : 'none',
            }}
            width={48}
            height={48}
            src={props.image}
          />
        </Flex>
        <Flex flex={1} justifyContent="center" flexDirection="column">
          <Flex justifyContent="space-between">
            <Text fontWeight={400} fontSize={2}>
              {props.title}
            </Text>
            <Text opacity={0.25} fontSize={2} fontWeight={400}>
              {props.version}
            </Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text opacity={0.4} fontSize={2} fontWeight={400}>
              {props.ship}
            </Text>
          </Flex>
        </Flex>
      </>
    );
  }
  return (
    <EmbedBox
      className="realm-cursor-hover"
      mt={1}
      mb={2}
      p={2}
      pr={3}
      customTextColor={props.textColor}
      customBg={props.bgColor}
      canHover={!props.loading}
      onClick={(evt: any) => {
        evt.preventDefault();
        // TODO make this open groups app and load url
      }}
    >
      {innerContent}
    </EmbedBox>
  );
};
