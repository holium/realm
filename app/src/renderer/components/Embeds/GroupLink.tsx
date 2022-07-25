import styled from 'styled-components';
import { Flex, EmbedBox, Text, Skeleton } from '..';

interface GroupViewProps {
  loading?: boolean;
  picture?: string;
  title: string;
  color?: string;
  bgColor?: string;
  textColor?: string;
  description: string;
  peers?: number;
}

const EmptyGroup = styled.div`
  height: 48px;
  width: 48px;
  background: ${(p) => p.color || '#000'};
  border-radius: 6px;
`;

export const GroupLink = (props: GroupViewProps) => {
  let innerContent: React.ReactNode;
  if (props.loading) {
    innerContent = (
      <>
        <Flex alignItems="center" mr={3}>
          <Skeleton style={{ borderRadius: 6 }} height={48} width={48} />
        </Flex>
        <Flex gap={8} flex={1} justifyContent="center" flexDirection="column">
          <Flex justifyContent="space-between">
            <Skeleton height={14} width={130} />
          </Flex>
          <Flex justifyContent="space-between">
            <Skeleton height={14} width={60} />
          </Flex>
        </Flex>
      </>
    );
  } else {
    innerContent = (
      <>
        <Flex alignItems="center" mr={3}>
          {props.picture ? (
            <img
              style={{ borderRadius: 6 }}
              width={48}
              height={48}
              src={props.picture}
            />
          ) : (
            <EmptyGroup color={props.color} />
          )}
        </Flex>
        <Flex justifyContent="center" flexDirection="column">
          <Text fontWeight={400} fontSize={2}>
            {props.title}
          </Text>
          <Text opacity={0.4} fontSize={2} fontWeight={400}>
            {props.description || `0 peers`}
          </Text>
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
      canHover={!props.loading}
      customTextColor={props.textColor}
      customBg={props.bgColor}
      onClick={(evt: any) => {
        evt.preventDefault();
        // TODO make this open groups app and load url
      }}
    >
      {innerContent}
    </EmbedBox>
  );
};
