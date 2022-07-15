import { FC, useEffect, useMemo, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Grid,
  Text,
  Flex,
  useMenu,
  Menu,
  ShipSearch,
  Input,
  Icons,
  Crest,
  TextButton,
  Card,
} from 'renderer/components';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { lighten, darken } from 'polished';
import { ThemeType } from 'renderer/theme';

interface IAutoCompleteBox {
  customBg: string;
  height?: any;
  theme: ThemeType;
}

const AutoCompleteBox = styled(motion.div)<IAutoCompleteBox>`
  position: relative;
  display: flex;
  z-index: 10;
  min-height: 40px;
  margin-top: 2px;
  padding: 4px 0px;
  border-radius: 9px;
  box-shadow: ${(props: IAutoCompleteBox) => props.theme.elevations['one']};
  border: 1px solid
    ${(props: IAutoCompleteBox) => props.theme.colors.ui.borderColor};

  background-color: ${(props: IAutoCompleteBox) => props.customBg};
`;

export const createPeopleForm = (
  defaults: any = {
    person: '',
  }
) => {
  const peopleForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const person = createField({
    id: 'person',
    form: peopleForm,
    initialValue: defaults.person || '',
  });

  return {
    peopleForm,
    person,
  };
};

export const InviteMembers: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { shell } = useServices();
    const { inputColor, windowColor, textColor, mode } = shell.desktop.theme;
    const { workflowState, setState } = props;
    const searchRef = useRef(null);

    // Setting up options menu
    useEffect(() => {
      // TODO remove after testing
      props.setState!({
        type: 'space',
        archetype: 'lodge',
        archetypeTitle: 'Lodge',
        name: 'The Chamber',
        color: '#000000',
        access: 'public',
      });
    }, []);

    const { peopleForm, person } = useMemo(() => createPeopleForm(), []);
    const [showShipSearch, setShowShipSearch] = useState(false);
    const [selectedPatp, setSelected] = useState<Set<string>>(new Set());
    const [selectedNickname, setSelectedNickname] = useState<Set<string>>(
      new Set()
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

    // const setWorkspaceState = (obj: any) => {
    //   setState &&
    //     setState({
    //       ...workflowState,
    //       ...obj,
    //     });
    // };

    const isOpen = useMemo(
      () => person.state.value.length && showShipSearch,
      [showShipSearch]
    );

    return workflowState ? (
      <Grid.Column noGutter lg={12} xl={12}>
        <Text
          fontSize={5}
          lineHeight="24px"
          fontWeight={500}
          mb={16}
          variant="body"
        >
          Invite members
        </Text>
        <Flex flexDirection="column" gap={16} justifyContent="flex-start">
          <Flex flexDirection="column" gap={16}>
            <Flex flexDirection="row" alignItems="center">
              <Crest
                color={workflowState.color}
                picture={workflowState.picture}
                size="md"
              />
            </Flex>
            <Flex
              position="relative"
              flexDirection="column"
              height="fit-content"
            >
              <Input
                tabIndex={1}
                name="person"
                ref={searchRef}
                height={34}
                leftIcon={<Icons opacity={0.6} name="UserAdd" />}
                placeholder="Enter Urbit ID"
                // rightInteractive
                // rightIcon={
                //   <TextButton onClick={(evt: any) => evt.stopPropagation()}>
                //     Add
                //   </TextButton>
                // }
                wrapperStyle={{
                  backgroundColor: inputColor,
                  borderRadius: 6,
                  paddingRight: 4,
                }}
                value={person.state.value}
                error={person.computed.ifWasEverBlurredThenError}
                onChange={(e: any) => {
                  console.log(e.target.value, showShipSearch);
                  if (e.target.value.length > 0) {
                    if (!showShipSearch) {
                      setShowShipSearch(true);
                    }
                  } else {
                    setShowShipSearch(false);
                  }
                  person.actions.onChange(e.target.value);
                }}
                onFocus={() => {
                  person.actions.onFocus();
                }}
                onBlur={() => {
                  person.actions.onBlur();
                }}
              />
              <AutoCompleteBox
                initial={{
                  opacity: 0,
                  y: 8,
                  height: 0,
                }}
                animate={{
                  opacity: isOpen ? 1 : 0,
                  y: 0,
                  height: 50,
                  transition: {
                    duration: 0.2,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  height: 50 / 2,
                  transition: {
                    duration: 0.2,
                  },
                }}
                customBg={
                  mode === 'light'
                    ? lighten(0.1, windowColor)
                    : darken(0.2, windowColor)
                }
              >
                <ShipSearch
                  heightOffset={0}
                  search={person.state.value}
                  selected={selectedPatp}
                  // customBg={windowColor}
                  onSelected={(contact: any) => {
                    onShipSelected(contact);
                    person.actions.onChange('');
                    setShowShipSearch(false);
                  }}
                />
              </AutoCompleteBox>
            </Flex>
          </Flex>
        </Flex>
      </Grid.Column>
    ) : null;
  }
);
