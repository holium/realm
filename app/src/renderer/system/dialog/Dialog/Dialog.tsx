import { WindowModelProps } from 'os/services/shell/desktop.model';
import { FC, useEffect, useRef, useState, useMemo } from 'react';

import {
  Flex,
  TextButton,
  Spinner,
  IconButton,
  Icons,
} from 'renderer/components';
import { dialogRenderers } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';

export interface DialogViewProps {
  window: WindowModelProps;
}

const View = styled.div<{ hasTitleBar?: boolean; background: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  width: inherit;
  height: inherit;
  padding: 24px 24px;
  background: ${(props) => props.background};
`;

export const DialogView: FC<DialogViewProps> = (props: DialogViewProps) => {
  const { window } = props;
  const { theme } = useServices();
  const elementRef = useRef(null);

  const [workflowState, setWorkflowState] = useState<any>({ loading: false });
  const [validated, setValidated] = useState<boolean>(false);

  const ViewComponent: FC<any> | undefined = useMemo(
    () => dialogRenderers[window.id].component!,
    [window.id]
  );

  const {
    workflow,
    customNext,
    firstStep,
    nextButtonText,
    onNext,
    hasPrevious,
    onPrevious,
    isValidated,
  } = dialogRenderers[window.id];
  useEffect(() => {
    if (firstStep) {
      setValidated(false);
    }
  }, [firstStep]);

  useEffect(() => {
    isValidated && setValidated(isValidated(workflowState));
  }, [isValidated, workflowState]);

  return (
    <View ref={elementRef} background={theme.currentTheme.windowColor}>
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
            theme={theme.currentTheme}
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
            {onPrevious && hasPrevious && hasPrevious() !== false && (
              <IconButton
                customBg={theme.currentTheme.windowColor}
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
              </TextButton>
            )}
          </Flex>
        </Flex>
      )}
    </View>
  );
};
