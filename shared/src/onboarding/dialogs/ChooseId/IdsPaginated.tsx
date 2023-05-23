import { useState } from 'react';
import styled from 'styled-components';

import { Flex, Icon, Spinner } from '@holium/design-system/general';

import { PatpCard } from '../../components/PatpCard';

const Paginator = styled.div`
  grid-column: 1 / 3;
  display: flex;
  justify-content: center;
  gap: 16px;
`;

type Props = {
  ids: string[];
  pageSize?: number;
  selectedId: string | undefined;
  onSelectId: (patp: string) => void;
};

export const IdsPaginated = ({
  ids,
  pageSize = 6,
  selectedId,
  onSelectId,
}: Props) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(ids.length / pageSize);
  const paginatedPatps = ids.slice(page * pageSize, (page + 1) * pageSize);
  const pages = Array.from({ length: totalPages }).map((_, i) => i);

  if (!ids.length) {
    return (
      <Flex justifyContent="center">
        <Spinner size={3} />
      </Flex>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
      }}
    >
      {paginatedPatps.map((patp) => (
        <PatpCard
          key={patp}
          patp={patp}
          isSelected={patp === selectedId}
          onClick={() => onSelectId(patp)}
        />
      ))}
      <Paginator>
        <button
          disabled={page === 0}
          type="button"
          onClick={() => setPage(page - 1)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            opacity: page === 0 ? 0.3 : 1,
          }}
        >
          <Icon
            name="ChevronRight"
            fill="icon"
            style={{ transform: 'rotate(180deg)' }}
          />
        </button>
        {pages.map((i) => (
          <button
            key={`circle-button-${i}`}
            type="button"
            onClick={() => setPage(i)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              opacity: i === page ? 1 : 0.3,
            }}
          >
            <Icon
              key={`circle-${i}`}
              className={`circle-${i}`}
              name="Circle"
              size={6}
              fill="icon"
            />
          </button>
        ))}
        <button
          disabled={page === totalPages - 1}
          type="button"
          onClick={() => setPage(page + 1)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            opacity: page === totalPages - 1 ? 0.3 : 1,
          }}
        >
          <Icon name="ChevronRight" fill="icon" />
        </button>
      </Paginator>
    </div>
  );
};
