import { darken, rgba } from 'polished';
import { motion } from 'framer-motion';
import { Flex, Sigil, Icons, IconButton } from 'renderer/components';
import styled from 'styled-components';

const sessionMembers: any[] = [
  {
    patp: '~dev',
    color: '#8419D9',
    avatar: null,
  },
  { patp: '~bus', color: '#3E89D1', avatar: null },
];

const AddMember = styled(IconButton)<{ dashColor: any }>`
  border: 1px dashed ${(props: any) => darken(0.1, props.dashColor)};
`;

interface SharedSessionProps {
  appId?: string;
  iconColor: string;
  backgroundColor?: string;
  dimensions?: any;
}

export const SharedAvatars = ({
  iconColor,
  backgroundColor,
}: SharedSessionProps) => (
  <Flex pl={1} flexDirection="row" alignItems="center">
    {/* {sessionMembers.length === 0 && (
        <Icons name="Friends" mr={1} color={rgba(iconColor!, 0.7)} />
      )} */}
    {sessionMembers.map((member: any, index: number) => (
      <motion.div
        key={member.patp}
        className="realm-cursor-hover"
        style={{
          display: 'flex',
          cursor: 'pointer',
          zIndex: sessionMembers.length - index,
          marginLeft: -1,
          height: 20,
          width: 20,
          alignItems: 'center',
          borderRadius: 5,
          backgroundColor,
          // zIndex: isDragging ? 2 : 1,
        }}
        whileHover={{ scale: 1.05, zIndex: 50 }}
        transition={{ scale: 0.2 }}
        whileTap={{ scale: 1.0 }}
        onPointerDown={(evt: any) => {
          evt.stopPropagation();
        }}
        onDrag={(evt: any) => {
          evt.stopPropagation();
        }}
      >
        <Sigil
          simple
          size={18}
          avatar={member.avatar}
          patp={member.patp}
          color={[member.color || '#000000', 'white']}
        />
      </motion.div>
    ))}
    <AddMember
      ml={sessionMembers.length === 0 ? 0 : '2px'}
      size={20}
      customBg="#97A3B2"
      dashColor={backgroundColor}
      onPointerDown={(evt: any) => {
        evt.stopPropagation();
      }}
      onDrag={(evt: any) => {
        evt.stopPropagation();
      }}
      onClick={(evt: any) => {
        evt.stopPropagation();
        evt.preventDefault();
        console.log('popup');
      }}
    >
      <Icons name="Plus" color={rgba(iconColor, 0.5)} />
    </AddMember>
  </Flex>
);
