import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Button, Flex, Icon, Spinner } from '@holium/design-system/general';

import { useAppState } from 'renderer/stores/app.store';
import { AppWindowMobxType } from 'renderer/stores/models/window.model';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';

import { DialogViewContainer } from './Dialog.styles';

type Props = {
  appWindow: AppWindowMobxType;
};

export const DialogView = ({ appWindow }: Props) => {
  const { shellStore } = useAppState();
  const elementRef = useRef(null);

  const [workflowState, setWorkflowState] = useState<any>({ loading: false });
  const [validated, setValidated] = useState<boolean>(false);

  const ViewComponent: FC<any> | undefined = useMemo(() => {
    const dialogRenderer = dialogRenderers[appWindow.appId];
    const dialogConfig: DialogConfig =
      dialogRenderer instanceof Function
        ? dialogRenderer(shellStore.dialogProps.toJSON())
        : dialogRenderer;
    return dialogConfig.component;
  }, [appWindow.appId, shellStore.dialogProps.toJSON()]);

  const dialogRenderer = dialogRenderers[appWindow.appId];
  const dialogConfig: DialogConfig =
    dialogRenderer instanceof Function
      ? dialogRenderer(shellStore.dialogProps.toJSON())
      : dialogRenderer;
  const {
    workflow,
    customNext,
    firstStep,
    nextButtonText,
    onNext,
    hasPrevious,
    onPrevious,
    isValidated,
  } = dialogConfig;
  useEffect(() => {
    if (firstStep) {
      setValidated(false);
    }
  }, [firstStep]);

  useEffect(() => {
    isValidated && setValidated(isValidated(workflowState));
  }, [isValidated, workflowState]);

  return (
    <DialogViewContainer innerRef={elementRef}>
      <Flex
        flex={1}
        flexDirection="column"
        justifyContent="space-between"
        gap={16}
        minHeight={0}
      >
        <Flex flex={1} minHeight={0}>
          {ViewComponent && (
            <ViewComponent
              onNext={(data: any) => {
                setValidated(false);
                onNext && onNext(data);
              }}
              isValidated={isValidated}
              onPrevious={onPrevious}
              setState={setWorkflowState}
              workflowState={workflowState}
            />
          )}
        </Flex>
        {workflow && (
          <Flex
            key={workflowState.id}
            id={workflowState.id}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width={customNext ? 30 : undefined}
          >
            <Flex alignItems="center" justifyContent="flex-start">
              {onPrevious && hasPrevious && hasPrevious() && (
                <Button.IconButton
                  size={26}
                  onClick={() => {
                    onPrevious();
                  }}
                >
                  <Icon name="ArrowLeftLine" size={20} opacity={0.5} />
                </Button.IconButton>
              )}
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              height={26}
            >
              {!customNext && onNext && (
                <Button.TextButton
                  showOnHover
                  py={1}
                  fontWeight={500}
                  disabled={!validated || workflowState.loading}
                  onClick={(evt: any) => {
                    onNext(evt, workflowState, setWorkflowState);
                  }}
                >
                  {workflowState.loading ? (
                    <Spinner size={0} />
                  ) : (
                    <>{nextButtonText || 'Next'}</>
                  )}
                </Button.TextButton>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </DialogViewContainer>
  );
};
