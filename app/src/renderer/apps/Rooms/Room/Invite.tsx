import { useRef, useState } from 'react';
import { useField, useForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';

import {
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { useAppState } from 'renderer/stores/app.store';

export const RoomInvite = observer(() => {
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const { loggedInAccount } = useAppState();

  const [loading, setLoading] = useState(false);

  const inviteForm = useForm({
    async onSubmit() {
      // console.log('submittingggg');
      // await OnboardingActions.addShip(values);

      // props.setState &&
      //   props.setState({ ...props.workflowState, ship: values });
      // props.onNext && props.onNext(values);

      if (inviteInputRef === undefined) return;

      if (inviteInputRef.current === null) return;

      const innerInvite = inviteInputRef.current.value;

      // if (innerInvite === '') return;

      setLoading(true);

      console.log('sending invite:', innerInvite);

      // RoomsActions.invite(room.id, innerInvite).then(() => {
      //   setLoading(false);
      //   // chatInputRef.current.value = '';
      //   invitePatp.actions.onChange('');
      //   setInvited((prevInvited) => [...prevInvited, innerInvite]);
      // });
    },
  });

  const invitePatp = useField({
    id: 'patp',
    form: inviteForm,
    initialValue: '',
    validate: (patp: string) => {
      // if (addedShips.includes(patp)) {
      //   return { error: 'Already added', parsed: undefined };
      // }

      if (patp === loggedInAccount?.serverId) {
        return { error: "You can't invite yourself!", parsed: undefined };
      }

      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }

      return { error: 'Invalid @p', parsed: undefined };
    },
  });

  return (
    <Flex flexDirection="column" flex={2} gap={4} p={2} alignItems="flex-start">
      <Flex flexDirection="row" gap={4} width="100%">
        <TextInput
          tabIndex={2}
          type="text"
          id="invite-patp"
          name="invite-patp"
          placeholder="~sampel-palnet"
          autoFocus
          ref={inviteInputRef}
          spellCheck={false}
          style={{
            borderRadius: 6,
          }}
          value={invitePatp.state.value}
          // value={''}
          error={
            invitePatp.computed.isDirty &&
            invitePatp.computed.ifWasEverBlurredThenError
          }
          onChange={(e: any) => {
            invitePatp.actions.onChange(e.target.value);
          }}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter') {
              evt.preventDefault();
              evt.stopPropagation();
              inviteForm.actions.submit();
            }
          }}
          onFocus={() => invitePatp.actions.onFocus()}
          onBlur={() => invitePatp.actions.onBlur()}
        />
        <Flex justifyContent="center" alignItems="center">
          <Button.TextButton
            tabIndex={2}
            style={{ padding: '6px 10px', borderRadius: 6, height: 35 }}
            color="intent-success"
            isDisabled={!inviteForm.computed.isValid}
            onClick={(evt: any) => {
              evt.preventDefault();
              evt.stopPropagation();
              inviteForm.actions.submit();
            }}
          >
            {loading ? (
              <Spinner mx={2} size={0} />
            ) : (
              <Text.Custom>Invite</Text.Custom>
            )}
          </Button.TextButton>
        </Flex>
      </Flex>

      <Flex
        flexDirection="column"
        gap={4}
        width="100%"
        maxHeight="300px"
        overflowY={'auto'}
        overflowX={'hidden'}
      >
        {[].map((patp: string, index: number) => {
          return (
            <Flex
              key={`room-invited-${patp}-${index}`}
              mt={4}
              flexDirection="row"
            >
              <Icon size={16} mr={4} name="CheckCircle">
                {' '}
              </Icon>
              <Text.Custom>{patp}</Text.Custom>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
});
