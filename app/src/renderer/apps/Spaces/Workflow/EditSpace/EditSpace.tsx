import { useEffect } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import { getSpacePath } from 'os/lib/text';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

import { EditSpaceBody } from './EditSpaceBody';
import { AccessOptionType, SpaceWorkFlowState } from './types';

type Props = BaseDialogProps & {
  workflowState: SpaceWorkFlowState;
  setState: (state: SpaceWorkFlowState) => void;
};

const EditSpacePresenter = ({ edit, workflowState, setState }: Props) => {
  const { loggedInAccount } = useAppState();
  const { spacesStore } = useShipStore();

  const existingSpace = spacesStore.spaces.get(edit?.space);

  const initialValues: SpaceWorkFlowState = {
    ...workflowState,
    path: existingSpace?.path,
    name: existingSpace?.name || '',
    description: existingSpace?.description || '',
    color: existingSpace?.color || '#000000',
    picture: existingSpace?.picture || '',
    access: (existingSpace?.access as AccessOptionType) || 'public',
    crestOption: existingSpace?.picture ? 'image' : 'color',
    theme: toJS(existingSpace?.theme),
    joinLink: existingSpace?.joinLink || '',
  };

  const updateState = (state: Partial<SpaceWorkFlowState>) => {
    setState?.({ ...workflowState, ...state });
  };

  useEffect(() => {
    updateState?.(initialValues);
  }, [existingSpace, setState]);

  return (
    <EditSpaceBody
      isGroupSpace={initialValues.type === 'group'}
      initialName={initialValues.name}
      initialDescription={initialValues.description}
      initialColor={initialValues.color}
      initialImage={initialValues.picture}
      initialAccessOption={initialValues.access}
      initialLink={initialValues.joinLink}
      joinLinkPayload={
        existingSpace
          ? {
              from: loggedInAccount?.serverId ?? '',
              space: {
                path: getSpacePath(
                  loggedInAccount?.serverId ?? '',
                  workflowState.name
                ),
                name: workflowState.name,
                picture: workflowState.image,
                description: workflowState.description,
                theme: JSON.stringify(workflowState.theme),
                membersCount: existingSpace?.members.list.length ?? 0,
              },
            }
          : undefined
      }
      updateState={updateState}
    />
  );
};

export const EditSpace = observer(EditSpacePresenter);
