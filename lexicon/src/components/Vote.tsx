import { Flex, Icon, Text } from '@holium/design-system';

import { Store, useStore } from '../store';
import { log } from '../utils';

interface WordItemProps {
  id: string;
  votes: any;
}
export const Vote = ({ id, votes }: WordItemProps) => {
  const api = useStore((store: Store) => store.api);
  const space = useStore((store: Store) => store.space);
  const shipName = useStore((store: Store) => store.shipName);

  const voteOnWord = async (
    id: string,
    voteType: null | boolean,
    voteId = ''
  ) => {
    if (!space) return;
    try {
      const result = await api.voteOnWord(
        space,
        id,
        voteId,
        voteType,
        shipName
      );
      log('voteOnWord result =>', result);
    } catch (e) {
      log('voteOnWord error =>', e);
    }
  };
  return (
    <Flex gap={10}>
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        gap={5}
        className="highlight-hover"
        role="button"
        onClick={(evt: any) => {
          //TODO: change to correct event
          evt.stopPropagation();

          if (votes?.currentShipVoted.vote === true) {
            //user already voted, remove his vote
            voteOnWord(id, null, votes?.currentShipVoted.voteId);
          } else if (votes?.currentShipVoted.vote === false) {
            //user voted down, remove the down vote and add an upvote
            voteOnWord(id, null, votes?.currentShipVoted.voteId); //make sure we do the delete command first because of the one vote constraint
            voteOnWord(id, true); //new up vote
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
          borderRadius: '6px',
        }}
      >
        <Icon
          opacity={0.7}
          name="ThumbsUp"
          iconColor={
            votes?.currentShipVoted.vote === true
              ? 'rgba(var(--rlm-accent-rgba))'
              : 'icon'
          }
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
                : 'rgba(var(--rlm-text-rgba), .7)',
          }}
        >
          {votes?.upVotes ?? 0}
        </Text.Body>
      </Flex>
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        gap={5}
        className="highlight-hover"
        role="button"
        onClick={(evt: any) => {
          evt.stopPropagation();

          if (votes?.currentShipVoted.vote === true) {
            //user up voted, remove his up vote and add a down vote
            voteOnWord(id, null, votes?.currentShipVoted.voteId); //make sure we do the delete command first because of the one vote constraint
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
          borderRadius: '6px',
        }}
      >
        <Icon
          opacity={0.7}
          name="ThumbsDown"
          size={20}
          iconColor={
            votes?.currentShipVoted.vote === false
              ? 'rgba(var(--rlm-intent-alert-rgba))'
              : 'icon'
          }
          style={{ marginBottom: -7, marginRight: -5 }}
        />

        <Text.Body
          opacity={0.7}
          style={{
            color:
              votes?.currentShipVoted.vote === false
                ? 'rgba(var(--rlm-intent-alert-rgba))'
                : 'rgba(var(--rlm-text-rgba))',
          }}
        >
          {votes?.downVotes ?? 0}
        </Text.Body>
      </Flex>
    </Flex>
  );
};
