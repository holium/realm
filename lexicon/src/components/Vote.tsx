import { Button, Flex, Icon, Text } from '@holium/design-system';

import api from '../api';
import { useStore } from '../store';
import { log, shipName } from '../utils';

interface WordItemProps {
  id: string;
  votes: any;
}
export const Vote = ({ id, votes }: WordItemProps) => {
  const { space } = useStore();
  const voteOnWord = async (
    id: string,
    voteType: null | boolean,
    voteId: string = ''
  ) => {
    if (!space) return;
    try {
      const result = await api.voteOnWord(
        space,
        id,
        voteId,
        voteType,
        '~' + shipName()
      );
      log('voteOnWord result =>', result);
    } catch (e) {
      log('voteOnWord error =>', e);
    }
  };
  return (
    <Flex gap={10}>
      <Button.IconButton
        onClick={(evt: any) => {
          //TODO: change to correct event
          evt.stopPropagation();

          if (votes?.currentShipVoted.vote === true) {
            //user already voted, remove his vote
            voteOnWord(id, null, votes?.currentShipVoted.voteId);
          } else if (votes?.currentShipVoted.vote === false) {
            //user voted down, remove the down vote and add an upvote
            voteOnWord(id, true); //new up vote
            voteOnWord(id, null, votes?.currentShipVoted.voteId);
          } else {
            //user has no other votes on this word, just up vote
            voteOnWord(id, true);
          }
        }}
        style={{
          backgroundColor:
            votes?.currentShipVoted.vote === true
              ? 'rgba(var(--rlm-accent-rgba), .1)'
              : 'transparent',
          paddingLeft: 4,
          paddingRight: 4,
        }}
        iconColor={votes?.currentShipVoted.vote === true ? 'accent' : 'icon'}
      >
        <Icon
          opacity={0.7}
          name="ThumbsUp"
          iconColor="accent"
          size={20}
          style={{
            marginTop: 3,
            marginRight: -5,
          }}
        />
        <Text.Body
          opacity=".7"
          style={{
            color:
              votes?.currentShipVoted.vote === true
                ? 'rgba(var(--rlm-accent-rgba))'
                : 'rgba(var(--rlm-text-color), .7)',
          }}
        >
          {votes?.upVotes ?? 0}
        </Text.Body>
      </Button.IconButton>
      <Button.IconButton
        onClick={(evt: any) => {
          evt.stopPropagation();

          if (votes?.currentShipVoted.vote === true) {
            //user up voted, remove his up vote and add a down vote
            voteOnWord(id, null, votes?.currentShipVoted.voteId);
            voteOnWord(id, false);
          } else if (votes?.currentShipVoted.vote === false) {
            //user already down voted, remove the down vote
            voteOnWord(id, null, votes?.currentShipVoted.voteId);
          } else {
            //user has no other votes on this word, just down vote
            voteOnWord(id, false);
          }
        }}
        style={{
          backgroundColor:
            votes?.currentShipVoted.vote === false
              ? 'rgba(var(--rlm-intent-alert-rgba),.1)'
              : 'transparent',
          paddingLeft: 4,
          paddingRight: 4,
        }}
        iconColor={
          votes?.currentShipVoted.vote === false ? 'intent-alert' : 'icon'
        }
      >
        <Icon
          opacity={0.7}
          name="ThumbsDown"
          size={20}
          style={{ marginBottom: -7, marginRight: -5 }}
        />

        <Text.Body
          opacity={0.7}
          style={{
            color:
              votes?.currentShipVoted.vote === false
                ? 'rgba(var(--rlm-intent-alert-rgba))'
                : 'rgba(var(--rlm-text-color))',
          }}
        >
          {votes?.downVotes ?? 0}
        </Text.Body>
      </Button.IconButton>
    </Flex>
  );
};
