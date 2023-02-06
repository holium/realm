import { useEffect, useState, useRef } from 'react';
import { isValidPatp } from 'urbit-ob';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { darken, lighten } from 'polished';
import { Flex, Box, Icons, Text, Sigil, Spinner } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { shortened, getBaseTheme } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { RecipientPayload } from 'os/services/tray/wallet.service';
import { ContainerFlex } from './styled';
import { Avatar, Input } from '@holium/design-system';

export const RecipientInput = observer(
  (props: {
    setValid: (
      valid: boolean,
      recipient: {
        address?: string;
        patp?: string;
        color?: string;
        patpAddress?: string;
      }
    ) => void;
  }) => {
    const { theme } = useServices();
    const { walletApp } = useTrayApps();

    const [icon, setIcon] = useState('blank');
    const [valueCache, setValueCache] = useState('');
    const [recipient, setRecipient] = useState('');
    const [recipientError, setRecipientError] = useState('');
    useEffect(() => {
      if (walletApp.navState.to) {
        setRecipient(walletApp.navState.to);
        onChange({ target: { value: walletApp.navState.to } });
      }
    }, []);

    // const [detailsLoading, setDetailsLoading] = useState(false);
    const [recipientDetails, setRecipientDetails] = useState<{
      failed: boolean;
      details: RecipientPayload | null;
    }>({ failed: false, details: null });
    const [currPromise, setCurrPromise] =
      useState<Promise<RecipientPayload> | null>(null);
    const loading = currPromise !== null;

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBackground = darken(0.04, theme.currentTheme.windowColor);

    const stateRef = useRef();
    /* @ts-expect-error */
    stateRef.current = { recipient, currPromise };

    // TODO: rewrite logic here, was from when we had fewer agent/service guarentees
    let timer: NodeJS.Timeout | null = null;
    const getRecipient = async (patp: string) => {
      const promise: Promise<RecipientPayload> = new Promise(
        (resolve, reject) => {
          timer && clearTimeout(timer);
          timer = setTimeout(() => {
            reject(new Error('Request timed out.'));
          }, 5000);

          try {
            WalletActions.getRecipient(patp).then((details) => {
              timer && clearTimeout(timer);
              resolve(details);
            });
          } catch (e) {
            clearTimeout(timer);
            reject(e);
          }
        }
      );
      setCurrPromise(promise);

      promise
        .then((details: RecipientPayload) => {
          if (details && details.address) {
            setRecipientDetails({ failed: false, details });
            setRecipientError('');
          } else {
            setRecipientDetails({ failed: true, details: { patp } });
          }

          if (details && details.gasEstimate) {
            // TODO: update once we have live estimates
          }
        })
        .catch((err: Error) => {
          console.error(err);
          /* @ts-expect-error */
          if (patp !== stateRef.current!.recipient!) return;
          setRecipientDetails({ failed: true, details: { patp } });
        })
        .finally(() => {
          /* @ts-expect-error */
          if (stateRef.current!.currPromise! === promise) {
            setCurrPromise(null);
          }
        });
    };

    useEffect(() => {
      if (
        !recipientDetails.failed &&
        recipientDetails.details?.patp === recipient
      ) {
        props.setValid(true, {
          patp: recipientDetails.details.patp,
          color: recipientDetails.details.recipientMetadata?.color!,
          address: recipientDetails.details.address!,
        });
      } else if (
        recipientDetails.failed &&
        recipientDetails.details?.patp === recipient
      ) {
        props.setValid(false, {});
      }
    }, [recipientDetails]);

    const onChange = (e: any) => {
      const value: string = e.target.value;
      const validAddress =
        walletApp.navState.network === 'ethereum'
          ? ethers.utils.isAddress(value)
          : false; // TODO add bitcoin validation
      const validPatp = isValidPatp(value);

      if (validAddress) {
        setIcon('spy');
        setValueCache(value);

        props.setValid(true, { address: value });
        return setRecipient(shortened(value));
      } else if (validPatp) {
        setIcon('sigil');
        setValueCache(value);
        getRecipient(value);
        // props.setValid(true, { patp: value });
      }
      // else if (isValidPatp(`~${value}`)) {
      //   // setIcon('sigil');
      //   // setValueCache(`~${value}`);
      //   // getRecipient(value);
      //   // props.setValid(true, { patp: value });
      //   return setRecipient(`~${value}`);
      // }
      else {
        setIcon('blank');
        setValueCache('');
        setRecipientDetails({ failed: false, details: null });
        props.setValid(false, {});
      }

      setRecipient(value);
    };

    const RecipientIcon = (props: { icon: string }) => {
      if (recipientDetails.details?.recipientMetadata) {
        const metadata = recipientDetails.details.recipientMetadata;
        return (
          <Avatar
            sigilColor={[metadata.color, 'white']}
            avatar={metadata.avatar}
            simple={true}
            size={24}
            patp={valueCache}
          />
        );
      }

      if (props.icon === 'spy')
        return (
          <Icons
            name="Spy"
            size="24px"
            color={themeData.colors.text.secondary}
          />
        );

      if (props.icon === 'sigil')
        return (
          <Avatar
            sigilColor={
              theme.currentTheme.mode === 'light'
                ? ['black', 'white']
                : ['white', 'black']
            }
            simple={true}
            size={24}
            patp={valueCache}
          />
        );

      const blankBg =
        theme.currentTheme.mode === 'light'
          ? lighten(0.1, themeData.colors.text.disabled)
          : darken(0.04, themeData.colors.text.disabled);
      return (
        <Box
          background={blankBg}
          height="24px"
          width="24px"
          borderRadius="5px"
        />
      );
    };

    return (
      <Flex flexDirection="column">
        <Flex width="100%" justifyContent="space-evenly" alignItems="center">
          <Text
            fontSize={1}
            variant="body"
            color={themeData.colors.text.secondary}
          >
            TO
          </Text>
          <ContainerFlex
            className="realm-cursor-hover"
            focusBorder={themeData.colors.brand.primary}
            px={1}
            py={1}
            width="240px"
            height="45px"
            borderRadius="7px"
            alignItems="center"
            background={panelBackground}
            border={`solid 1px ${
              recipientError
                ? themeData.colors.text.error
                : themeData.colors.ui.borderColor
            }`}
          >
            <Flex ml={1} mr={2}>
              <RecipientIcon icon={icon} />
            </Flex>
            <Flex flexDirection="column">
              <Input
                width="100%"
                placeholder="@p or recipient’s address"
                spellCheck="false"
                value={recipient}
                onChange={onChange}
              />
              {recipientDetails.details?.address && (
                <Text
                  fontSize={1}
                  variant="body"
                  opacity={0.7}
                  color={themeData.colors.text.tertiary}
                >
                  {shortened(recipientDetails.details?.address)}
                </Text>
              )}
            </Flex>
            {loading && (
              <Flex mr={2}>
                <Spinner
                  ml={2}
                  size="14px"
                  color={themeData.colors.brand.primary}
                />
              </Flex>
            )}
          </ContainerFlex>
        </Flex>
        <Flex mt={2} width="100%" justifyContent="flex-end">
          <Text
            variant="body"
            fontSize="11px"
            color={themeData.colors.text.error}
          >
            {recipientDetails.failed &&
              recipientDetails.details?.patp === recipient &&
              `${recipient} doesn\'t have a Realm wallet.`}
            &nbsp;&nbsp;&nbsp;
          </Text>
        </Flex>
      </Flex>
    );
  }
);
