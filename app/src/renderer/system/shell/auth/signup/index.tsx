import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidPatp } from 'urbit-ob';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import {
  Icons,
  Card,
  Flex,
  Grid,
  Box,
  ActionButton,
  IconButton,
  TextButton,
  Spinner,
} from '../../../../components';

import { AddShip } from './add-ship';
import { ConnectingShip } from './connecting';
import { useMst } from '../../../../logic/store';
import UrbitSVG from '../../../../../../assets/urbit.svg';

export const createShipForm = (
  defaults: any = {
    urbitId: '~labruc-dillyx-lomder-librun',
    shipUrl: 'https://test-moon-1.holium.network',
    accessKey: 'mapfel-dalmec-halfen-sorhes',
  }
) => {
  const shipForm = createForm({
    onSubmit({ values }) {
      return values;
    },
  });

  const urbitId = createField({
    id: 'urbit-id',
    form: shipForm,
    initialValue: defaults.urbitId || '',
    // validationSchema: yup.string().required('Name is required'),
    validate: (patp: string) => {
      if (patp.length > 1 && isValidPatp(patp)) {
        return { error: undefined, parsed: patp };
      }

      return { error: 'Invalid patp', parsed: undefined };
    },
  });
  const shipUrl = createField({
    id: 'ship-id',
    form: shipForm,
    initialValue: defaults.shipUrl || '',
    validationSchema: yup
      .string()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        'Enter correct url!'
      )
      .required('Please enter url'),
  });
  const accessKey = createField({
    id: 'access-key',
    form: shipForm,
    initialValue: defaults.accessKey || '',
    validationSchema: yup
      .string()
      .matches(
        /[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}-[a-z][a-z-]{5}$/,
        'Enter correct access key'
      )
      .required('Please enter access key required'),
  });
  return {
    shipForm,
    urbitId,
    shipUrl,
    accessKey,
  };
};

// TODO add memory router
type LoginProps = {
  isFullscreen?: boolean;
  goToLogin: () => void;
};

export const Signup: FC<LoginProps> = observer((props: LoginProps) => {
  const { goToLogin } = props;
  const { shipStore } = useMst();
  const [step, setStep] = useState(0);

  const { shipForm, urbitId, shipUrl, accessKey } = useMemo(
    () => createShipForm(),
    []
  );

  // const isBackDisabled = step === 0;
  const goBack = () => {
    if (step === 0) {
      goToLogin();
    } else {
      setStep(step - 1);
    }
  };
  const isNextDisabled =
    (step === 0 && !shipForm.computed.isValid) || step === 2;
  const next = () => {
    if (!isNextDisabled) {
      goToLogin(); // TODO remove this when I finish the flow
      // setStep(step + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="signup-card"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        exit={{ scale: 0 }}
      >
        <Card
          pt={24}
          pl={12}
          pr={24}
          pb={50}
          width={560}
          height={300}
          // height="inherit"
          position="relative"
        >
          <Grid.Row expand noGutter>
            <Grid.Column
              noGutter
              expand
              mt={2}
              lg={5}
              xl={5}
              align="center"
              justify="center"
            >
              <img src={UrbitSVG} alt="urbit logo" />
              <ActionButton
                tabIndex={-1}
                mt={5}
                height={32}
                rightContent={<Icons ml={2} size={1} name="ArrowRightLine" />}
              >
                Get Urbit ID
              </ActionButton>
            </Grid.Column>
            {step === 0 && (
              // eslint-disable-next-line jsx-a11y/no-access-key
              <AddShip
                hasShips={shipStore.hasShips}
                urbitId={urbitId}
                shipUrl={shipUrl}
                accessKey={accessKey}
              />
            )}
            {step === 1 && <ConnectingShip />}
            {step === 2 && <div>Step 2</div>}
          </Grid.Row>
          <Box position="absolute" height={40} bottom={20} left={20} right={24}>
            <Flex
              mt={5}
              width="100%"
              alignItems="center"
              justifyContent="space-between"
            >
              <IconButton onClick={() => goBack()}>
                <Icons name="ArrowLeftLine" />
              </IconButton>
              <TextButton
                disabled={isNextDisabled}
                // loading={shipStore.isLoading}
                onClick={(evt: any) => {
                  if (step === 0) {
                    const formData = shipForm.actions.submit();
                    console.log(formData);
                    shipStore
                      .addShip({
                        ship: formData['urbit-id'],
                        url: formData['ship-id'],
                        code: formData['access-key'],
                      })
                      .then((value: any) => {
                        // eslint-disable-next-line promise/no-callback-in-promise
                        next();
                        evt.target.blur();
                        return null;
                      })
                      .catch((reason: any) => {
                        console.log(reason);
                      });
                  } else {
                    next();
                  }
                }}
              >
                {shipStore.isLoading ? <Spinner size={0} /> : 'Next'}
              </TextButton>
            </Flex>
          </Box>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});

export default Signup;
