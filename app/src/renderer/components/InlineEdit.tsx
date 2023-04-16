import React, { forwardRef } from 'react';
import { StyledComponentProps } from 'styled-components';
import { Flex, TextInput, BoxProps } from '@holium/design-system';

type InlineEditProps = {
  id: string;
  error?: boolean;
  disabled?: boolean;
} & BoxProps &
  StyledComponentProps<'input', any, any, never>;

export const InlineEdit: any = forwardRef<HTMLInputElement, InlineEditProps>(
  ({ flex, mb, mt, mx, my, ml, mr, disabled, ...props }, ref) => {
    if (!ref) ref = React.createRef();
    const keypressHandler = (event: any) => {
      if (event.key === 'Enter') {
        // @ts-expect-error
        ref.current.blur();
      }
    };
    return (
      <Flex
        alignItems="center"
        position="relative"
        mx={mx}
        my={my}
        mb={mb}
        mt={mt}
        ml={ml}
        mr={mr}
        flex={flex}
      >
        <TextInput
          id={props.id}
          name={props.id}
          ref={ref}
          py={2}
          disabled={disabled}
          aria-invalid={props.error ? 'true' : 'false'}
          onKeyDown={(event: any) => keypressHandler(event)}
        />
      </Flex>
    );
  }
);

InlineEdit.defaultProps = {
  error: false,
  type: 'text',
};
