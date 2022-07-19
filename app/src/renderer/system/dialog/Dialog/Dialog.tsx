import { WindowModelProps } from 'os/services/shell/desktop.model';
import { FC, useEffect, useRef, useState } from 'react';
import { dialogRenderers } from 'renderer/system/dialog/dialogs';
import { Flex, TextButton, IconButton, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';

export interface DialogViewProps {
  window: WindowModelProps;
}

const View = styled.div<{ hasTitleBar?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  width: inherit;
  height: inherit;
  padding: 24px 24px;
`;

export const DialogView: FC<DialogViewProps> = (props: DialogViewProps) => {
  const { window } = props;
  const { shell } = useServices();
  const elementRef = useRef(null);

  const [workflowState, setWorkflowState] = useState<any>(null);
  const [validated, setValidated] = useState<boolean>(false);

  const ViewComponent: FC<any> | undefined =
    dialogRenderers[window.id].component!;
  const { workflow, customNext, firstStep, onNext, onPrevious, isValidated } =
    dialogRenderers[window.id];

  useEffect(() => {
    if (firstStep) {
      setValidated(false);
      setWorkflowState(null);
    }
  }, [firstStep]);

  useEffect(() => {
    isValidated && setValidated(isValidated(workflowState));
  }, [isValidated, workflowState]);

  console.log('rendering dialog');

  return (
    <View ref={elementRef}>
      <Flex flex={1}>
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
          position="absolute"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          bottom={20}
          right={20}
          left={20}
          width={customNext ? 30 : undefined}
        >
          <Flex alignItems="center" justifyContent="flex-start">
            {onPrevious && (
              <IconButton
                customBg={shell.desktop.theme.backgroundColor}
                onClick={() => {
                  onPrevious();
                }}
              >
                <Icons name="ArrowLeftLine" />
              </IconButton>
            )}
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            {!customNext && onNext && (
              <TextButton
                disabled={!validated}
                onClick={(evt: any) => {
                  onNext(evt);
                }}
              >
                Next
              </TextButton>
            )}
          </Flex>
        </Flex>
      )}
    </View>
  );
};
