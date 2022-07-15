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

const AutoCompleteBox = styled(motion.div)`
  position: relative;
  z-index: 10;
  min-height: 60px;
  padding: 8px;
  background-color: ${(props: any) => props.custombg};
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
    const { inputColor, windowColor, textColor } = shell.desktop.theme;
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

    // const setWorkspaceState = (obj: any) => {
    //   setState &&
    //     setState({
    //       ...workflowState,
    //       ...obj,
    //     });
    // };

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
              {/* {addMember} */}
              <Input
                tabIndex={1}
                name="person"
                ref={searchRef}
                height={34}
                leftIcon={<Icons opacity={0.6} name="UserAdd" />}
                placeholder="Enter Urbit ID"
                rightInteractive
                rightIcon={
                  <TextButton onClick={(evt: any) => evt.stopPropagation()}>
                    Add
                  </TextButton>
                }
                wrapperStyle={{
                  backgroundColor: inputColor,
                  borderRadius: 6,
                  paddingRight: 4,
                }}
                value={person.state.value}
                error={person.computed.ifWasEverBlurredThenError}
                onChange={(e: any) => {
                  person.actions.onChange(e.target.value);
                }}
                onFocus={() => {
                  person.actions.onFocus();
                }}
                onBlur={() => {
                  person.actions.onBlur();
                }}
              />
              {/* <Card position="relative" style={{ height: 'fit-content' }}> */}
              <AutoCompleteBox customBg={windowColor}>
                <ShipSearch
                  heightOffset={0}
                  search={person.state.value}
                  selected={new Set()}
                  // customBg={windowColor}
                  onSelected={(contact: any) => {}} // onShipSelected(contact)
                />
              </AutoCompleteBox>
              {/* </Card> */}
            </Flex>
          </Flex>
        </Flex>
      </Grid.Column>
    ) : null;
  }
);
