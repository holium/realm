import { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Grid,
  Flex,
  Text,
  Input,
  Icons,
  IconButton,
  FormControl,
  TextButton,
  Tag,
  Spinner,
} from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { darken, lighten } from 'polished';
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

export const NewChat = observer((props: IProps) => {
  const { height, headerOffset, theme, onBack, onCreateNewDm } = props;
  const { contacts } = useServices();
  const { textColor, iconColor, dockColor, windowColor } = theme;
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
      let metadata: any;
      if (contacts.getContactAvatarMetadata(contactsList[0])) {
        metadata = contacts.getContactAvatarMetadata(contactsList[0]);
      }
      //
      setLoading(true);
      const newDm = await ShipActions.draftDm(contactsList, [metadata]);
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
        overflowX="scroll"
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
                <Text fontSize={2}>{contactName}</Text>
                {nickname ? (
                  <Text ml={2} fontSize={2} opacity={0.7}>
                    {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
                  </Text>
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
    <Grid.Column
      style={{ position: 'relative', color: textColor }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Titlebar
        hasBorder={false}
        zIndex={5}
        theme={{
          ...props.theme,
          windowColor,
        }}
      >
        <Flex flex={1} justifyContent="space-between" alignItems="center">
          <Flex position="relative" zIndex={3} pl={3}>
            <IconButton
              customBg={dockColor}
              className="realm-cursor-hover"
              size={28}
              color={iconColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
                onBack();
              }}
            >
              <Icons name="ArrowLeftLine" />
            </IconButton>
          </Flex>
          <Flex
            zIndex={2}
            position="absolute"
            width="100%"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            flex={1}
          >
            <Text
              opacity={0.8}
              style={{ textTransform: 'uppercase' }}
              fontWeight={600}
            >
              New Chat
            </Text>
          </Flex>
          <Flex position="relative" zIndex={3} pr="6px">
            <TextButton
              disabled={selectedPatp.size === 0}
              onClick={(evt: any) => {
                evt.stopPropagation();
                submitNewChat(evt);
              }}
            >
              Create
            </TextButton>
          </Flex>
        </Flex>
      </Titlebar>
      <Grid.Column
        gap={4}
        pt={0}
        mb={3}
        noGutter
        expand
        marginTop={headerOffset}
        overflowY="hidden"
        height={height - headerOffset}
        style={{ backgroundColor: windowColor, position: 'relative' }}
      >
        <FormControl.Field mt={2}>
          <Input
            tabIndex={1}
            name="new-contact"
            className="realm-cursor-text-cursor"
            height={32}
            placeholder="Who would you like to add?"
            // onKeyDown={submitNewChat} TODO make enter on valid patp add to selectedPatp
            value={patp}
            onChange={(e: any) => setPatp(e.target.value)}
            // onFocus={() => urbitId.actions.onFocus()}
            // onBlur={() => urbitId.actions.onBlur()}
            wrapperStyle={{
              marginLeft: 8,
              marginRight: 8,
              width: 'calc(100% - 16px)',
              borderRadius: 9,
              borderColor: 'transparent',
              backgroundColor:
                theme.mode === 'dark'
                  ? lighten(0.1, windowColor)
                  : darken(0.055, windowColor),
            }}
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
            <Text mt={3} opacity={0.4}>
              {selectedPatp.size > 1 ? 'Creating group chat...' : ''}
            </Text>
          </Flex>
        )}
        {contactArray}
        <Flex pl={2} pr={2} flex={1} flexDirection="column">
          <ShipSearch
            search={patp}
            selected={selectedPatp}
            customBg={windowColor}
            onSelected={(contact: any) => onShipSelected(contact)}
          />
        </Flex>
      </Grid.Column>
    </Grid.Column>
  );
});
