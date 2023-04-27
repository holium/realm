import { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';

import {
  Avatar,
  Box,
  Flex,
  Icon,
  Spinner,
  Text,
  TextInput,
} from '@holium/design-system';

import { RecipientPayload } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { shortened } from '../../../lib/helpers';
import { ContainerFlex } from './styled';

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
    const { walletStore } = useShipStore();

    const [icon, setIcon] = useState('blank');
    const [valueCache, setValueCache] = useState('');
    const [recipient, setRecipient] = useState('');
    useEffect(() => {
      if (walletStore.navState.to) {
        setRecipient(walletStore.navState.to);
        onChange({ target: { value: walletStore.navState.to } });
      }
    }, []);

    const [recipientDetails, setRecipientDetails] = useState<{
      failed: boolean;
      details: RecipientPayload | null;
    }>({ failed: false, details: null });
    const [currPromise, setCurrPromise] =
      useState<Promise<RecipientPayload> | null>(null);
    const loading = currPromise !== null;

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
            walletStore.getRecipient(patp).then((details) => {
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
          if (patp !== stateRef.current.recipient) return;
          setRecipientDetails({ failed: true, details: { patp } });
        })
        .finally(() => {
          /* @ts-expect-error */
          if (stateRef.current.currPromise === promise) {
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
          color: recipientDetails.details.recipientMetadata?.color,
          address: recipientDetails.details.address ?? '',
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
        walletStore.navState.network === 'ethereum'
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

      if (props.icon === 'spy') return <Icon name="Spy" size="24px" />;

      if (props.icon === 'sigil')
        return (
          <Avatar
            simple={true}
            size={24}
            patp={valueCache}
            sigilColor={['#000000', 'white']}
          />
        );

      return <Box height="24px" width="24px" borderRadius="5px" />;
    };

    return (
      <Flex flexDirection="column" gap={10}>
        <Flex width="100%" justifyContent="space-evenly" alignItems="center">
          <Text.Body fontSize={1} variant="body">
            TO
          </Text.Body>
          <ContainerFlex
            className="realm-cursor-hover"
            width="240px"
            height="45px"
            borderRadius="7px"
            alignItems="center"
          >
            <Flex>
              <RecipientIcon icon={icon} />
            </Flex>
            <Flex flexDirection="column">
              <TextInput
                id="recipient-input"
                name="recipient-input"
                width="100%"
                placeholder="@p or recipient’s address"
                spellCheck="false"
                value={recipient}
                onChange={onChange}
              />
              {recipientDetails.details?.address && (
                <Text.Body fontSize={1} variant="body" opacity={0.7}>
                  {shortened(recipientDetails.details?.address)}
                </Text.Body>
              )}
            </Flex>
            {loading && (
              <Flex mr={2}>
                <Spinner ml={2} size="14px" />
              </Flex>
            )}
          </ContainerFlex>
        </Flex>
        <Flex width="100%" justifyContent="flex-end">
          <Text.Body variant="body" fontSize="11px">
            {recipientDetails.failed &&
              recipientDetails.details?.patp === recipient &&
              `${recipient} doesn't have a Realm wallet.`}
            &nbsp;&nbsp;&nbsp;
          </Text.Body>
        </Flex>
      </Flex>
    );
  }
);
