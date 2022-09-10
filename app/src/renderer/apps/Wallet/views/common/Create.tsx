import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Button, Label, Input } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useField, useForm } from 'mobx-easy-form';
import { NetworkType } from 'os/services/tray/wallet.model';
import { FieldSet } from 'renderer/components/Input/FormControl/Field';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface CreateWalletProps {
  network: NetworkType
}

export const CreateWallet: FC<CreateWalletProps> = observer((props: CreateWalletProps) => {
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(false);
  const form = useForm({
    async onSubmit({ values }) {
      if (form.computed.isDirty) {
        setLoading(true);
        try {
          console.log(`creating wallet ${values.nickname}`)
          await WalletActions.createWallet('', 'ethereum', values.nickname);
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
  });

  return (
    <Flex p={4} height="100%" width="100%" flexDirection="column">
      <Text mt={3} variant="h4">
        Create Wallet
      </Text>
      <Text mt={3} variant="body">
        A new {props.network === NetworkType.ethereum ? 'ethererum' : 'bitcoin' } wallet will be created. Give it a memorable nickname.
      </Text>
      <FieldSet mt={8}>
        <Label required={true}>Nickname</Label>
        <Input name="nickname" placeholder="Fort Knox" />
        <Flex mt={5} width="100%">
          <Button width="100%" isLoading={loading} disabled={form.computed.isDirty}>Create</Button>
        </Flex>
      </FieldSet>
    </Flex>
  );
});
