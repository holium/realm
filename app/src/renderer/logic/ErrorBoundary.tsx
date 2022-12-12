import { Component, ErrorInfo, ReactNode } from 'react';
import { Anchor, Flex, Text } from 'renderer/components';

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
    console.log('error~');
    return { error, errorInfo };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <Flex alignItems="center" flexDirection="column">
          <Flex maxWidth={500} flexDirection="column" my={8}>
            <Text fontSize={8} fontWeight={600}>
              Something went wrong.
            </Text>
            <Text my={4}>
              The issue has been logged. Please refresh the page, and reach out
              to{' '}
              <Anchor
                href="https://twitter.com/holium_corp"
                rel="noreferrer"
                target="_blank"
                m={0}
              >
                @holium_corp
              </Anchor>{' '}
              if the issue persists.
            </Text>
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
