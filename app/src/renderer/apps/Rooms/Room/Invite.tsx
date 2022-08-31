import { FC, useRef, useState, useMemo } from 'react';
import { Flex, IconButton, Icons, Input, Spinner, Text, TextButton } from 'renderer/components';
import { createField, createForm, useField, useForm } from 'mobx-easy-form';
import { useServices } from 'renderer/logic/store';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { useTrayApps } from 'renderer/apps/store';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';



interface InviteRoomProps {}

// export const inviteForm = (
//   defaults: any = {
//     netChat: '',
//   }
// ) => {
//   const form = createForm({
//     onSubmit({ values }: { values: any }) {
//       return values;
//     },
//   });

//   const invitePatp = createField({
//     id: 'invite-patp',
//     form,
//     initialValue: defaults.name || '',
//     validate: (patp: string) => {
//       // if (addedShips.includes(patp)) {
//       //   return { error: 'Already added', parsed: undefined };
//       // }

//       if (patp.length > 1 && isValidPatp(patp)) {
//         return { error: undefined, parsed: patp };
//       }

//       return { error: 'Invalid patp', parsed: undefined };
//     },
//   });

//   return {
//     form,
//     invitePatp,
//   };
// };

export const RoomInvite: FC<InviteRoomProps> = observer((props: InviteRoomProps) => {
  // const { form, invitePatp } = useMemo(() => inviteForm(), []);
  const { roomsApp } = useTrayApps();
  const room = roomsApp.liveRoom!;

  const inviteInputRef = useRef<HTMLInputElement>(null);

  const { desktop, ship } = useServices();
  const theme = desktop.theme;

  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);
  


  const inviteForm = useForm({
    async onSubmit({ values }: any) {
      // console.log('submittingggg');
      // await OnboardingActions.addShip(values);

      // props.setState &&
      //   props.setState({ ...props.workflowState, ship: values });
      // props.onNext && props.onNext(values);

      if (inviteInputRef === undefined) return;
  
      if (inviteInputRef.current === null) return;
  
      let innerInvite = inviteInputRef.current.value;
  
      // if (innerInvite === '') return;
  
      setLoading(true);
  
      console.log('sending invite:', innerInvite);

  
      RoomsActions.invite(room.id, innerInvite
      ).then(() => {
        setLoading(false);
        // chatInputRef.current!.value = '';
        invitePatp.actions.onChange('');
        setInvited(prevInvited => [...prevInvited, innerInvite])
      });

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

      if (patp === ship!.patp) {
        return { error: "You can't invite yourself!", parsed: undefined };
      }

      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }
      

      return { error: 'Invalid @p', parsed: undefined };
    },
  });

  return (
    <Flex flexDirection="column" flex={1} gap={4} p={2}  alignItems="flex-start">
      <Flex flexDirection="row" gap={4}>
        <Input
            tabIndex={2}
            className="realm-cursor-text-cursor"
            type="text"
            placeholder="~sampel-palnet"
            autoFocus
            ref={inviteInputRef}
            spellCheck={false}
            wrapperStyle={{
              cursor: 'none',
              borderRadius: 6,
              backgroundColor: theme.inputColor,
            }}
            value={invitePatp.state.value}
            // value={''}
            error={!invitePatp.computed.isDirty || invitePatp.computed.error}
            onChange={(e: any) => {
              invitePatp.actions.onChange(e.target.value);
            }}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter') {
                evt.preventDefault();
                evt.stopPropagation();
                inviteForm.actions.submit()
              }
            }}
            onFocus={() => invitePatp.actions.onFocus()}
            onBlur={() => invitePatp.actions.onBlur()}
           />
           <Flex justifyContent="center" alignItems="center">
              <TextButton
                style={{ padding: '6px 10px', borderRadius: 6, height: 35, }}
                showBackground
                textColor="#0FC383"
                highlightColor="#0FC383"
                disabled={!inviteForm.computed.isValid}
                onClick={(evt: any) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  inviteForm.actions.submit();
                }}
              >
                  {loading ? <Spinner mx={2} size={0} /> : <Text>Invite</Text> }
              </TextButton>
            </Flex>
          </Flex>
          
          <Flex flexDirection='column' gap={4}>
          {invited.map((patp: string, index: number) => {
            return (
              <Flex key={`room-invited-${patp}-${index}`} mt={4}
                flexDirection='row'
               >
                <Icons mr={4} name="CheckCircle"> </Icons>
                <Text>{patp}</Text>
              </Flex>
              )})}
          </Flex>
          
      </Flex>
      );
})

