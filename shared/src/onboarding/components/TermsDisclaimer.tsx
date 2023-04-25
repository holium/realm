import styled from 'styled-components';

import { OnboardDialogDescription } from './OnboardDialog.styles';

const OnboardDialogTerms = styled(OnboardDialogDescription)`
  font-size: 12px;
  opacity: 0.8;
`;

const OnboardDialogTermsLink = styled(OnboardDialogTerms)`
  display: inline;
  text-decoration: underline;
  cursor: pointer;
`;

type Props = {
  onClick: () => void;
};

export const TermsDisclaimer = ({ onClick }: Props) => (
  <OnboardDialogTerms>
    By using Realm, you agree to our{' '}
    <OnboardDialogTermsLink onClick={onClick}>
      Terms of Service
    </OnboardDialogTermsLink>
    .
  </OnboardDialogTerms>
);
