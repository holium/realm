import styled from 'styled-components';
import { ColorVariants } from '@holium/design-system';

type Props = {
  fill?: ColorVariants;
};

const Path = styled.path<Props>`
  ${({ fill }) => fill && `fill: rgba(var(--rlm-${fill}-rgba));`}
`;

export const ArrowRightIcon = ({ fill }: Props) => (
  <svg
    width="20"
    height="21"
    viewBox="0 0 20 21"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <Path
      fill={fill}
      d="M13.4763 9.66689L9.00634 5.19689L10.1847 4.01855L16.6663 10.5002L10.1847 16.9819L9.00634 15.8036L13.4763 11.3336H3.33301V9.66689H13.4763Z"
    />
  </svg>
);
