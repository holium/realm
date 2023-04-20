import { Component, ErrorInfo, ReactNode } from 'react';
import { Anchor, Flex, Text } from '@holium/design-system';

type State = {
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

type Props = {
  children: ReactNode;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error, errorInfo: ErrorInfo) {
    return { error, errorInfo };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <Flex
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Flex maxWidth="100%" flexDirection="column" my={8}>
            <Text.Custom fontSize={4} fontWeight={600}>
              Something went wrong.
            </Text.Custom>
            <Text.Custom my={4} maxWidth={500}>
              The issue has been logged. Please refresh the page, and reach out
              to{' '}
              <Anchor
                href="https://twitter.com/HoliumCorp"
                rel="noreferrer"
                target="_blank"
              >
                @HoliumCorp
              </Anchor>{' '}
              if the issue persists.
            </Text.Custom>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </Flex>
        </Flex>
      );
    }

    return this.props.children;
  }
}
