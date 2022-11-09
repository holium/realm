import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import {
  Button,
  Flex,
  FormControl,
  Grid,
  Label,
  Input,
  Text,
  TextButton,
  Spinner,
} from 'renderer/components';
import { ShellActions } from 'renderer/logic/actions/shell';
import { useServices } from 'renderer/logic/store';

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => any;
}

export const ConfirmDialog: FC = observer((props: ConfirmDialogProps) => {
  const { theme, spaces } = useServices();
  const [loading, setLoading] = useState(false);
  const { inputColor, windowColor } = theme.currentTheme;
  console.log('props', props)

  return (
    <Flex
      flex={1}
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Text
        style={{ fontWeight: 800 }}
      >
        {props.title}
      </Text>
      <Text>
        {props.description}
      </Text>
      <Flex justifyContent="space-between">
        <TextButton
          tabIndex={2}
          style={{ fontWeight: 400 }}
          onClick={() => {
            ShellActions.closeDialog();
            ShellActions.setBlur(false);
          }}
        >
          Cancel
        </TextButton>
        <TextButton
          tabIndex={1}
          highlightColor="#EC415A"
          textColor="#EC415A"
          style={{ fontWeight: 400 }}
          onClick={() => props.onConfirm()}
        >
          {loading ? <Spinner size={0} /> : 'Confirm'}
        </TextButton>
      </Flex>
    </Flex>
  );
});
