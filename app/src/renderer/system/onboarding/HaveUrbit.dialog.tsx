import { observer } from 'mobx-react';
import { Grid, Text, Flex, Button, UrbitSVG } from 'renderer/components';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';

const HaveUrbitDialogPresenter = (props: BaseDialogProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  function selectSelfHosted() {
    props.setState &&
      props.setState({ ...props.workflowState, selfHosted: true });
    props.onNext && props.onNext(true);
  }

  function selectHosted() {
    props.setState &&
      props.setState({ ...props.workflowState, selfHosted: false });
    props.onNext && props.onNext(false);
  }

  return (
    <Grid.Column noGutter lg={12} xl={12} px={32}>
      <Grid.Row>
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <UrbitSVG
            mode={theme.currentTheme.mode as 'light' | 'dark'}
            size={40}
          />
          <Text ml={12} fontSize={3} fontWeight={400}>
            Have an Urbit ID?
          </Text>
        </Flex>
      </Grid.Row>
      <Grid.Row>
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={2} lineHeight="copy" variant="body">
            An Urbit ID is like a phone number. It’s how your friends connect
            with you on Urbit.
          </Text>
        </Flex>
      </Grid.Row>
      <Grid.Row>
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
        >
          <Flex
            flexDirection="column"
            alignItems="top"
            justifyContent="space-between"
          >
            <Button
              variant="minimal"
              alignSelf="center"
              fontWeight={500}
              onClick={selectHosted}
            >
              Sign up
            </Button>
            <Text
              mt={20}
              fontSize={2}
              fontWeight={400}
              color={baseTheme.colors.text.disabled}
              onClick={selectSelfHosted}
            >
              Already have one?
            </Text>
          </Flex>
        </Flex>
      </Grid.Row>
    </Grid.Column>
  );
};

export const HaveUrbitDialog = observer(HaveUrbitDialogPresenter);
