import { FC } from 'react';
import styled, { css } from 'styled-components';
import {
  fontSize,
  fontWeight,
  margin,
  MarginProps,
  FontSizeProps,
  FontWeightProps,
} from 'styled-system';
// @ts-expect-error its there...
import UrbitSVG from '../../../../assets/urbit.svg';
import { Grid, Text, Flex, Button, TextButton } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';
// import { TextButton } from 'renderer/components/Button/TextButton';

const SecondaryButtonText = styled(TextButton)<
  FontSizeProps & FontWeightProps & MarginProps
>`
  ${fontSize}
  ${fontWeight}
  ${margin}
  color: rgba(101, 101, 101, 0.44);
  border: none;
  &:hover {
    color: rgba(101, 101, 101, 0.65);
  }
`;

const HaveUrbitDialog: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
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
            <img height={40} src={UrbitSVG} alt="urbit logo" />
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
              <SecondaryButtonText
                mt={20}
                fontSize={2}
                fontWeight={400}
                onClick={selectSelfHosted}
              >
                Already have one?
              </SecondaryButtonText>
            </Flex>
          </Flex>
        </Grid.Row>
      </Grid.Column>
    );
  }
);

export default HaveUrbitDialog;
