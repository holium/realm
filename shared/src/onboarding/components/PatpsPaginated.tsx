import { Icon } from '@holium/design-system';
import { useState } from 'react';
import { PatpCard } from './PatpCard';
import styled from 'styled-components';

const Paginator = styled.div`
  grid-column: 1 / 3;
  display: flex;
  justify-content: center;
  gap: 16px;
`;

type Props = {
  patps: string[];
  pageSize?: number;
  selectedPatp: string | undefined;
  onSelectPatp: (patp: string) => void;
};

export const PatpsPaginated = ({
  patps,
  pageSize = 6,
  selectedPatp,
  onSelectPatp,
}: Props) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(patps.length / pageSize);
  const paginatedPatps = patps.slice(page * pageSize, (page + 1) * pageSize);
  const pages = Array.from({ length: totalPages }).map((_, i) => i);

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
          isSelected={patp === selectedPatp}
          onClick={() => onSelectPatp(patp)}
        />
      ))}
      <Paginator>
        <button
          disabled={page === 0}
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
