import { Button, Flex, Icon } from '../../../general';
import { InputBox } from '../../input/InputBox/InputBox';

// Used by holium.com.
export const ChatInputSkeleton = () => (
  <Flex width="100%" flexDirection="column" overflow="visible">
    <InputBox
      inputId="id"
      px={0}
      disabled={true}
      error={false}
      borderRadius={24}
    >
      <Flex
        flex={1}
        flexDirection="column"
        py={2}
        px={2}
        justifyContent="flex-end"
      >
        <Flex flex={1} flexDirection="row" alignItems="flex-end" gap={4}>
          <Flex>
            <Button.IconButton size={22} disabled={true}>
              <Icon name="Attachment" size={20} opacity={0.5} />
            </Button.IconButton>
          </Flex>
          <Flex flex={1} />
          <Flex>
            <Button.IconButton disabled>
              <Icon name="ArrowRightLine" size={20} opacity={0.5} />
            </Button.IconButton>
          </Flex>
        </Flex>
      </Flex>
    </InputBox>
  </Flex>
);
