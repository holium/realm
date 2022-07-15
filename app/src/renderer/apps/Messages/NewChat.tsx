import { FC, useCallback, useMemo, useRef, useState } from 'react';
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
  Box,
  Badge,
  Tag,
} from 'renderer/components';
import { toJS } from 'mobx';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { darken, lighten, rgba } from 'polished';
import { ShipSearch } from 'renderer/components/ShipSearch';
import { useServices } from 'renderer/logic/store';

type IProps = {
  theme: ThemeModelType;
  headerOffset: number;
  height: number;
  onBack: () => void;
  onCreateNewDm: (newDmKey: any) => void;
};

export const NewChat: FC<IProps> = observer((props: IProps) => {
  const { height, headerOffset, theme, onBack, onCreateNewDm } = props;
  const { ship } = useServices();
  const { inputColor, textColor, iconColor, dockColor, windowColor } = theme;
  // const windowColor = useMemo(
  //   () => rgba(lighten(0.225, props.theme.windowColor), 0.8),
  //   [props.theme.windowColor]
  // );

  // const { newChatForm, urbitId } = createNewChatForm();

  const [patp, setPatp] = useState<string>('');

  const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
  const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
    new Set()
  );

  const submitNewChat = useCallback(
    (event: any) => {
      // if (event.keyCode === 13) {
      event.preventDefault();
      const contacts = Array.from(selectedPatp.values());
      let metadata: any;
      if (ship?.contacts.getContactAvatarMetadata(contacts[0])) {
        metadata = ship?.contacts.getContactAvatarMetadata(contacts[0]);
      }
      const newDm = ship?.chat.sendNewDm(contacts, metadata)!;
      onCreateNewDm(newDm);
    },
    [selectedPatp]
  );

  const onShipSelected = (contact: [string, string?]) => {
    console.log('selecting', contact);
    const patp = contact[0];
    const nickname = contact[1];
    // const pendingAdd = selectedPatp;
    selectedPatp.add(patp);
    setSelected(new Set(selectedPatp));
    selectedNickname.add(nickname ? nickname : '');
    setSelectedNickname(new Set(selectedNickname));
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
        height={height}
        style={{ backgroundColor: windowColor }}
      >
        <FormControl.Field>
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
              backgroundColor: inputColor,
            }}
          />
        </FormControl.Field>
        {contactArray}
        <ShipSearch
          heightOffset={90}
          search={patp}
          selected={selectedPatp}
          customBg={windowColor}
          onSelected={(contact: any) => onShipSelected(contact)}
        />
      </Grid.Column>
    </Grid.Column>
  );
});
