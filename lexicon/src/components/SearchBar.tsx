import { Button, Flex, Icon, TextInput } from '@holium/design-system';

interface Props {
  addModalOpen: boolean;
  onAddWord: () => void;
  backButton: boolean;
  onBack: () => void;
}
export const SearchBar = ({
  onAddWord,
  addModalOpen,
  backButton,
  onBack,
}: Props) => {
  return (
    <Flex flex={1} gap={10} justifyContent={'center'} marginBottom={12}>
      {backButton && (
        <Button.IconButton onClick={() => onBack()}>
          <Icon name="ArrowLeftLine" size={22} />
        </Button.IconButton>
      )}
      <TextInput
        id="search-input"
        name="search"
        required
        leftAdornment={<Icon name="Search" size={16} opacity={0.7} />}
        style={{
          paddingLeft: 9,
        }}
        value={''}
        placeholder="Search words"
        error={false}
        onChange={() => null}
      />
      {!backButton && (
        <Button.TextButton
          fontSize={1}
          fontWeight={600}
          onClick={() => onAddWord()}
          disabled={addModalOpen}
        >
          Add Word
        </Button.TextButton>
      )}
    </Flex>
  );
};
