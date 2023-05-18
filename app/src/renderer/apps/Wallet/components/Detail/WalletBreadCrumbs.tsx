import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

const BreadCrumbs = styled(Text.Body)`
  display: flex;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  gap: 4px;
  opacity: 0.5;
`;

const FirstBreadCrumb = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

type Props = {
  walletNickname: string;
  coinName?: string;
  onClickBack: () => void;
};

export const WalletBreadCrumbs = ({
  walletNickname,
  coinName,
  onClickBack,
}: Props) => {
  if (!coinName) return <BreadCrumbs>{walletNickname}</BreadCrumbs>;

  return (
    <Flex alignItems="center" gap={8}>
      <BreadCrumbs>
        <FirstBreadCrumb onClick={onClickBack}>
          {walletNickname}
        </FirstBreadCrumb>
        <span>/</span>
        <span>{coinName}</span>
      </BreadCrumbs>
    </Flex>
  );
};
