import styled from 'styled-components';

import { OnboardDialogDescription } from './OnboardDialog.styles';

export const OnboardDialogFooter = styled(OnboardDialogDescription)`
  font-size: 12px;
  opacity: 0.8;
`;

export const OnboardDialogFooterLink = styled(OnboardDialogFooter)`
  display: inline;
  text-decoration: underline;
  cursor: pointer;
`;

type Props = {
  onClick: () => void;
};

export const TermsDisclaimer = ({ onClick }: Props) => (
  <OnboardDialogFooter>
    By using Realm, you agree to Holium's{' '}
    <OnboardDialogFooterLink onClick={onClick}>
      Terms of Service
    </OnboardDialogFooterLink>
    .
  </OnboardDialogFooter>
);
