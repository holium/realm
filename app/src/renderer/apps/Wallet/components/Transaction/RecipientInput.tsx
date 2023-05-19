import { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';

import { Flex, Spinner, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import {
  NetworkType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';

import { shortened } from '../../helpers';
import { RecipientIcon } from './RecipientIcon';

type Props = {
  to: string | undefined;
  network: NetworkType;
  setValid: (
    valid: boolean,
    recipient: {
      address?: string;
      patp?: string;
      color?: string;
      patpAddress?: string;
    }
  ) => void;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
};

const RecipientInputPresenter = ({
  to,
  network,
  setValid,
  getRecipient: getRecipientFn,
}: Props) => {
  const [icon, setIcon] = useState('blank');
  const [valueCache, setValueCache] = useState('');
  const [recipient, setRecipient] = useState('');
  useEffect(() => {
    if (to) {
      setRecipient(to);
      onChange({ target: { value: to } } as any);
    }
  }, []);

  const [recipientDetails, setRecipientDetails] = useState<{
    failed: boolean;
    details: RecipientPayload | null;
  }>({ failed: false, details: null });
  const [currPromise, setCurrPromise] =
    useState<Promise<RecipientPayload> | null>(null);
  const loading = currPromise !== null;

  const stateRef = useRef<{
    recipient: string;
    currPromise: Promise<RecipientPayload> | null;
  }>({ recipient: '', currPromise: null });
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
          getRecipientFn(patp).then((details) => {
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
        if (patp !== stateRef.current.recipient) return;
        setRecipientDetails({ failed: true, details: { patp } });
      })
      .finally(() => {
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
      setValid(true, {
        patp: recipientDetails.details.patp,
        color: recipientDetails.details.recipientMetadata?.color,
        address: recipientDetails.details.address ?? '',
      });
    } else if (
      recipientDetails.failed &&
      recipientDetails.details?.patp === recipient
    ) {
      setValid(false, {});
    }
  }, [recipientDetails]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value: string = e.target.value;
    const validAddress =
      network === 'ethereum' ? ethers.utils.isAddress(value) : false; // TODO add bitcoin validation
    const validPatp = isValidPatp(value);

    if (validAddress) {
      setIcon('spy');
      setValueCache(value);

      setValid(true, { address: value });
      return setRecipient(shortened(value));
    } else if (validPatp) {
      setIcon('sigil');
      setValueCache(value);
      getRecipient(value);
      // setValid(true, { patp: value });
    }
    // else if (isValidPatp(`~${value}`)) {
    //   // setIcon('sigil');
    //   // setValueCache(`~${value}`);
    //   // getRecipient(value);
    //   // setValid(true, { patp: value });
    //   return setRecipient(`~${value}`);
    // }
    else {
      setIcon('blank');
      setValueCache('');
      setRecipientDetails({ failed: false, details: null });
      setValid(false, {});
    }

    setRecipient(value);
  };

  return (
    <Flex flexDirection="column">
      <Flex width="100%" alignItems="center" gap="16px">
        <Text.Body fontSize={1} variant="body">
          TO
        </Text.Body>
        <TextInput
          id="recipient-input"
          name="recipient-input"
          width="100%"
          placeholder="@p or recipient’s address"
          spellCheck="false"
          value={recipient}
          onChange={onChange}
          leftAdornment={
            <RecipientIcon
              recipientMetadata={recipientDetails.details?.recipientMetadata}
              valueCache={valueCache}
              icon={icon}
            />
          }
          rightAdornment={
            loading ? (
              <Flex mr={2}>
                <Spinner ml={2} size="14px" />
              </Flex>
            ) : undefined
          }
        />
      </Flex>
      <Flex mt="4px" ml="36px" gap="2px" flexDirection="column">
        {recipientDetails.details?.address && (
          <Text.Body mt="4px" fontSize={1} variant="body" opacity={0.7}>
            {shortened(recipientDetails.details?.address)}
          </Text.Body>
        )}
        {recipientDetails.failed && (
          <Text.Custom fontSize="11px" color="intent-caution">
            {recipientDetails.details?.patp === recipient
              ? `${recipient} doesn't have a Realm wallet.`
              : 'Invalid address or ship.'}
          </Text.Custom>
        )}
      </Flex>
    </Flex>
  );
};

export const RecipientInput = observer(RecipientInputPresenter);
