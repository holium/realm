import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Button, Label, Input, Icons } from 'renderer/components';
import { useField, useForm } from 'mobx-easy-form';
import { NetworkType, WalletView } from 'os/services/tray/wallet.model';
import { FieldSet } from 'renderer/components/Input/FormControl/Field';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { useServices } from 'renderer/logic/store';

interface CreateWalletProps {
  network: NetworkType;
}

export const CreateWallet: FC<CreateWalletProps> = observer(
  (props: CreateWalletProps) => {
    const { theme } = useServices();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const form = useForm({
      async onSubmit({ values }) {
        if (form.computed.isDirty) {
          setLoading(true);
          try {
            console.log(`creating wallet ${values.nickname}`);
            await WalletActions.createWallet(values.nickname);
            setLoading(false);
          } catch (reason) {
            console.error(reason);
            setLoading(false);
            setError(true);
          }
        }
      },
    });

    const nickname = useField({
      id: 'nickname',
      form: form,
      initialValue: '',
      validate: (nickname: string) => {
        return nickname.length
          ? { parsed: nickname }
          : { error: 'Must enter nickname.' };
      },
    });

    return (
      <Flex p={4} height="100%" width="100%" flexDirection="column">
        <Text mt={2} variant="h4">
          Create Wallet
        </Text>
        <Text mt={3} variant="body">
          A new{' '}
          {props.network === 'ethereum' ? 'Ethereum' : 'Bitcoin'}{' '}
          wallet will be created. Give it a memorable nickname.
        </Text>
        <FieldSet mt={8}>
          <Label required={true}>Nickname</Label>
          <Input
            value={nickname.state.value}
            onChange={(e) => nickname.actions.onChange(e.target.value)}
            placeholder="Fort Knox"
          />
          <Flex mt={5} width="100%">
            <Button
              id="submit"
              width="100%"
              isLoading={loading}
              disabled={!form.computed.isValid}
              onClick={form.actions.submit}
            >
              Create
            </Button>
          </Flex>
        </FieldSet>
        <Flex
          position="absolute"
          top="582px"
          zIndex={999}
          onClick={() => WalletActions.navigateBack()}
        >
          <Icons
            name="ArrowLeftLine"
            size={2}
            color={theme.currentTheme.iconColor}
          />
        </Flex>
      </Flex>
    );
  }
);
