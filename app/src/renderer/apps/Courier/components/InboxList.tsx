import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NoScrollBar } from '@holium/design-system';

interface InboxListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemHeight: number;
  width: number;
  height: number;
  sortFunction?: (a: T, b: T) => number;
  filterFunction?: (item: T) => boolean;
}

function InboxList<T>({
  items,
  renderItem,
  itemHeight,
  width,
  height,
  sortFunction,
  filterFunction,
}: InboxListProps<T>) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(
    Math.min(items.length, Math.ceil(window.innerHeight / itemHeight))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [sortedItems, setSortedItems] = useState(items);

  useEffect(() => {
    const filteredItems = filterFunction ? items.filter(filterFunction) : items;
    const sortedItems = sortFunction
      ? filteredItems.sort(sortFunction)
      : filteredItems;
    setSortedItems(sortedItems);
  }, [items, sortFunction, filterFunction]);

  const handleScroll = () => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const newEndIndex = Math.min(
      sortedItems.length,
      Math.ceil((scrollTop + window.innerHeight) / itemHeight)
    );
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  const visibleItems = sortedItems.slice(startIndex, endIndex);

  return (
    <NoScrollBar
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height,
        width,
        flexDirection: 'column',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      <motion.div style={{ height: `${startIndex * itemHeight}px` }} />
      {visibleItems.map((item, index) => (
        <motion.div key={index} style={{ height: `${itemHeight}px` }}>
          {renderItem(item)}
        </motion.div>
      ))}
      <motion.div
        style={{ height: `${(sortedItems.length - endIndex) * itemHeight}px` }}
      />
    </NoScrollBar>
  );
}

export default InboxList;
