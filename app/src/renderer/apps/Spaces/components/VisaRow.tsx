import { Patp } from 'os/types';
import { useState } from 'react';
import { Text, TextButton, Flex, IconTypes } from 'renderer/components';
import { Spinner } from '@holium/design-system';
import { Row } from 'renderer/components/NewRow';
import { SpacesActions } from 'renderer/logic/actions/spaces';

import { EmptyGroup } from '../SpaceRow';

interface IVisaRow {
  title: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: IconTypes;
  image: string | null;
  color: string | null;
  customBg?: string;
  invitedBy?: Patp;
  path: string;
  buttonText?: string;
  subtitle?: string;
  onClick?: (data: any) => void;
  onAccept?: (data: any) => void;
  onButtonClick?: (data: any) => void;
}

export const VisaRow = ({
  disabled,
  customBg,
  image,
  color,
  title,
  path,
  invitedBy,
  onClick,
}: IVisaRow) => {
  const [declining, setDeclining] = useState(false);
  const [joining, setJoining] = useState(false);

  const onDecline = async () => {
    setDeclining(true);
    SpacesActions.declineInvite(path)
      .then(() => {
        setDeclining(false);
      })
      .catch((err) => {
        console.error(err);
        setDeclining(false);
      });
  };
  const onJoin = async () => {
    setJoining(true);
    SpacesActions.acceptInvite(path)
      .then(() => {
        setJoining(false);
      })
      .catch((err) => {
        console.error(err);
        setJoining(false);
      });
  };
  return (
    // <SpaceRowStyle
    //   data-close-tray="true"
    //   style={{ width: '100%' }}
    //   className="realm-cursor-hover"
    //   selected={selected}
    //   customBg={colorTheme}
    //   onClick={() => {
    //     onSelect(`/${ship.patp}/our`);
    //   }}
    // >
    <Row
      selected
      disabled={disabled}
      gap={8}
      customBg={customBg}
      style={{ padding: 12, flexDirection: 'column', alignItems: 'flex-start' }}
      onClick={(evt: any) => {
        evt.stopPropagation();
        onClick && onClick(title);
      }}
    >
      <Flex gap={16} flexDirection="row" alignItems="center">
        {image ? (
          <img
            alt="group"
            style={{ borderRadius: 6 }}
            height="32px"
            width="32px"
            src={image}
          />
        ) : (
          <EmptyGroup color={color || '#000000'} />
        )}
        <Flex
          flex={1}
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex flexDirection="column">
            <Text mb="2px" opacity={0.9} fontSize={3} fontWeight={500}>
              {title}
            </Text>
            <Text opacity={0.5} fontSize={2} fontWeight={400}>
              invited by {invitedBy}
              {/* invited by ~rilmyl-soltyd-lomder-librun */}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        gap={10}
        width="100%"
        flex={1}
        flexDirection="row"
        justifyContent="flex-end"
      >
        <TextButton
          fontSize={2}
          style={{ borderRadius: 6 }}
          highlightColor="#EC415A"
          textColor="#EC415A"
          showBackground
          onClick={(evt: any) => {
            evt.stopPropagation();
            onDecline();
          }}
        >
          {declining ? <Spinner size={0} /> : 'Decline'}
        </TextButton>
        <TextButton
          fontSize={2}
          showBackground
          style={{ borderRadius: 6 }}
          highlightColor="#4E9EFD"
          onClick={(evt: any) => {
            evt.stopPropagation();
            onJoin();
          }}
        >
          {joining ? <Spinner size={0} /> : 'Join'}
        </TextButton>
      </Flex>
      {/* </SpaceRowStyle> */}
    </Row>
  );
};
