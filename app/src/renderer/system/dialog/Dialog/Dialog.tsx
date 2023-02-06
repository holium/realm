import { WindowModelProps } from 'os/services/shell/desktop.model';
import {
  FC,
  useEffect,
  useRef,
  useState,
  useMemo,
  ReactNode,
  RefObject,
} from 'react';
import {
  Flex,
  TextButton,
  Spinner,
  IconButton,
  Icons,
} from 'renderer/components';
import { DialogConfig, dialogRenderers } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import styled from 'styled-components';

export interface DialogViewProps {
  window: WindowModelProps;
}

type ViewProps = {
  ref: RefObject<HTMLDivElement>;
  background: string;
  hasTitleBar?: boolean;
  children?: ReactNode;
};

const View = styled.div<ViewProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  width: inherit;
  height: inherit;
  padding: 24px 24px;
  background: ${(props) => props.background};
`;

export const DialogView: FC<DialogViewProps> = (props: DialogViewProps) => {
  const { window } = props;
  const { theme, shell } = useServices();
  const elementRef = useRef(null);

  const [workflowState, setWorkflowState] = useState<any>({ loading: false });
  const [validated, setValidated] = useState<boolean>(false);

  const ViewComponent: FC<any> | undefined = useMemo(() => {
    const dialogRenderer = dialogRenderers[window.id];
    const dialogConfig: DialogConfig =
      dialogRenderer instanceof Function
        ? dialogRenderer(shell.dialogProps.toJSON())
        : dialogRenderer;
    return dialogConfig.component!;
  }, [window.id, shell.dialogProps.toJSON()]);

  const dialogRenderer = dialogRenderers[window.id];
  const dialogConfig: DialogConfig =
    dialogRenderer instanceof Function
      ? dialogRenderer(shell.dialogProps.toJSON())
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
    <View ref={elementRef} background={theme.currentTheme.windowColor}>
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
              theme={theme.currentTheme}
            />
          )}
        </Flex>
        {workflow && (
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width={customNext ? 30 : undefined}
          >
            <Flex alignItems="center" justifyContent="flex-start">
              {onPrevious && hasPrevious && hasPrevious() && (
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
            <Flex
              alignItems="center"
              justifyContent="space-between"
              height={26}
            >
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
      </Flex>
    </View>
  );
};
