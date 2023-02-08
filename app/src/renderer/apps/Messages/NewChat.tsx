import { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import { FormControl, Tag, Spinner } from 'renderer/components';
import { Flex, Text, TextInput, Icon, Button } from '@holium/design-system';
import { ThemeModelType } from 'os/services/theme.model';
import { ShipSearch } from 'renderer/components/ShipSearch';
import { useServices } from 'renderer/logic/store';
import { DMPreviewType } from 'os/services/ship/models/courier';
import { ShipActions } from 'renderer/logic/actions/ship';

interface IProps {
  theme: ThemeModelType;
  headerOffset: number;
  height: number;
  onBack: () => void;
  onCreateNewDm: (newDmKey: DMPreviewType) => void;
}

const NewChatPresenter = (props: IProps) => {
  const { height, headerOffset, onBack, onCreateNewDm } = props;
  const { contacts } = useServices();
  const [loading, setLoading] = useState(false);
  const [patp, setPatp] = useState<string>('');

  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
  const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
    new Set()
  );

  const submitNewChat = useCallback(
    async (event: any) => {
      // if (event.keyCode === 13) {
      event.preventDefault();
      const contactsList = Array.from(selectedPatp.values());
      const metadata: any = [];
      for (let i = 0; i < contactsList.length; i++) {
        metadata.push(contacts.getContactAvatarMetadata(contactsList[i]));
      }
      // if (contacts.getContactAvatarMetadata(contactsList[0])) {
      //   metadata = contacts.getContactAvatarMetadata(contactsList[0]);
      // }
      //
      setLoading(true);
      const newDm = await ShipActions.draftDm(contactsList, metadata);
      setLoading(false);
      onCreateNewDm(newDm);
    },
    [contacts, onCreateNewDm, selectedPatp]
  );

  const onShipSelected = (contact: [string, string?]) => {
    const patp = contact[0];
    const nickname = contact[1];
    // const pendingAdd = selectedPatp;
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    selectedNickname.add(nickname || '');
    setSelectedNickname(new Set(selectedNickname));
    setPatp('');
  };

  const onShipRemove = (contact: [string, string?]) => {
    selectedPatp.delete(contact[0]);
    selectedNickname.delete(contact[1]!);
    setSelected(new Set(selectedPatp));
    setSelectedNickname(new Set(selectedNickname));
  };

  let contactArray;
  if (selectedPatp.size) {
    const dmContacts = Array.from(selectedPatp.values());
    const contactNicknames = Array.from(selectedNickname.values());
    contactArray = (
      <Flex
        overflowX="auto"
        ml={2}
        gap={8}
        height={36}
        pr={2}
        flexDirection="row"
        alignItems="center"
      >
        {dmContacts.map((contactName: string, index: number) => {
          const nickname = contactNicknames[index];
          return (
            <Tag
              minimal
              intent="info"
              key={contactName}
              onRemove={(evt: any) => {
                evt.stopPropagation();
                onShipRemove([contactName, nickname]);
              }}
            >
              <Flex alignItems="center" width="max-content">
                <Text.Custom fontSize={2}>{contactName}</Text.Custom>
                {nickname ? (
                  <Text.Custom ml={2} fontSize={2} opacity={0.7}>
                    {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
                  </Text.Custom>
                ) : (
                  []
                )}
              </Flex>
            </Tag>
          );
        })}
      </Flex>
    );
  }

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="10px"
      >
        <Flex flex={1} justifyContent="space-between" alignItems="center">
          <Flex position="relative" zIndex={3}>
            <Button.IconButton
              className="realm-cursor-hover"
              size={26}
              onClick={(evt: any) => {
                evt.stopPropagation();
                onBack();
              }}
            >
              <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
            </Button.IconButton>
          </Flex>
          <Flex
            zIndex={2}
            position="absolute"
            width="calc(100% - 24px)"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            flex={1}
          >
            <Text.Custom
              opacity={0.8}
              textTransform="uppercase"
              fontWeight={600}
            >
              New Chat
            </Text.Custom>
          </Flex>
          <Flex position="relative" zIndex={3}>
            <Button.TextButton
              showOnHover
              height={26}
              fontWeight={500}
              disabled={selectedPatp.size === 0}
              onClick={(evt: any) => {
                evt.stopPropagation();
                submitNewChat(evt);
              }}
            >
              Create
            </Button.TextButton>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        gap={4}
        pt={0}
        mb={3}
        flexDirection="column"
        overflowY="hidden"
        position="relative"
        height={height - headerOffset}
      >
        <FormControl.Field>
          <TextInput
            id="new-chat-patp-search"
            name="new-chat-patp-search"
            tabIndex={1}
            mx={2}
            width="100%"
            className="realm-cursor-text-cursor"
            placeholder="Who would you like to add?"
            value={patp}
            onChange={(e: any) => setPatp(e.target.value)}
            // onFocus={() => urbitId.actions.onFocus()}
            // onBlur={() => urbitId.actions.onBlur()}
            // onKeyDown={submitNewChat} TODO make enter on valid patp add to selectedPatp
          />
        </FormControl.Field>
        {loading && (
          <Flex
            left={0}
            right={0}
            top={0}
            bottom={50}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            position="absolute"
          >
            <Spinner size={1} />
            <Text.Custom mt={3} opacity={0.4}>
              {selectedPatp.size > 1 ? 'Creating group chat...' : ''}
            </Text.Custom>
          </Flex>
        )}
        {contactArray}
        <Flex flex={1} flexDirection="column">
          <ShipSearch
            search={patp}
            selected={selectedPatp}
            onSelected={(contact: any) => onShipSelected(contact)}
          />
        </Flex>
      </Flex>
    </>
  );
};

export const NewChat = observer(NewChatPresenter);
