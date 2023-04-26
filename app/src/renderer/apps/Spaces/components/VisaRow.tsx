import { observer } from 'mobx-react';

import {
  Button,
  Flex,
  IconPathsType,
  Row,
  Spinner,
  Text,
} from '@holium/design-system';

import { Patp } from 'os/types';
import { useShipStore } from 'renderer/stores/ship.store';

import { EmptyGroup } from '../SpaceRow';

interface IVisaRow {
  title: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: IconPathsType;
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

export const VisaRowPresenter = ({
  disabled,
  image,
  color,
  title,
  path,
  invitedBy,
  onClick,
}: IVisaRow) => {
  const { spacesStore } = useShipStore();
  const acceptLoader = spacesStore.invitations.pendingAccept.get(path);
  const declineLoader = spacesStore.invitations.pendingDecline.get(path);

  const onDecline = async () => {
    spacesStore.invitations
      .declineInvite(path)
      // .then(() => {
      //   spacesStore.invitations.pendingDecline.get(path)?.set('loaded');
      // })
      .catch((err) => {
        console.error(err);
        // spacesStore.invitations.pendingDecline.get(path)?.set('error');
      });
  };
  const onJoin = async () => {
    spacesStore.invitations
      .acceptInvite(path)
      // .then(() => {
      //   spacesStore.invitations.pendingAccept.get(path)?.set('loaded');
      // })
      .catch((err) => {
        console.error(err);
        // spacesStore.invitations.pendingAccept.get(path)?.set('error');
      });
  };
  return (
    <Row
      disabled={disabled}
      // customBg={customBg}

      style={{
        padding: 12,
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(var(--rlm-accent-rgba), .08)',
      }}
      onClick={(evt: any) => {
        evt.stopPropagation();
        onClick && onClick(title);
      }}
    >
      <Flex gap={16} row align="center">
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
            <Text.Custom mb="2px" opacity={0.9} fontSize={3} fontWeight={500}>
              {title}
            </Text.Custom>
            <Text.Custom opacity={0.5} fontSize={2} fontWeight={400}>
              invited by {invitedBy}
            </Text.Custom>
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
        <Button.TextButton
          style={{ borderRadius: 6 }}
          color="intent-alert"
          onClick={(evt: any) => {
            evt.stopPropagation();
            onDecline();
          }}
        >
          {declineLoader?.isLoading ? <Spinner size={0} /> : 'Decline'}
        </Button.TextButton>
        <Button.TextButton
          style={{ borderRadius: 6 }}
          onClick={(evt: any) => {
            evt.stopPropagation();
            onJoin();
          }}
        >
          {acceptLoader?.isLoading ? <Spinner size={0} /> : 'Accept'}
        </Button.TextButton>
      </Flex>
    </Row>
  );
};

export const VisaRow = observer(VisaRowPresenter);
