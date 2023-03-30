import React, { useState, useRef, useEffect } from 'react';

interface MessageListProps<T> {
  items: T[];
  itemKey: (item: T) => string;
  itemRenderer: (item: T, height: number) => React.ReactNode;
  itemMinHeight?: number;
  sortFunction?: (a: T, b: T) => number;
  filterFunction?: (item: T) => boolean;
}

function MessageList<T>({
  items,
  itemKey,
  itemRenderer,
  itemMinHeight = 50,
  sortFunction,
  filterFunction,
}: MessageListProps<T>) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(
    Math.min(items.length, Math.ceil(window.innerHeight / itemMinHeight))
  );
  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({});
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
    const newStartIndex = Math.floor(scrollTop / itemMinHeight);
    const newEndIndex = Math.min(
      sortedItems.length,
      Math.ceil((scrollTop + window.innerHeight) / itemMinHeight)
    );
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  useEffect(() => {
    const newHeights: { [key: string]: number } = {};
    for (let i = startIndex; i < endIndex; i++) {
      const item = sortedItems[i];
      const key = itemKey(item);
      const height = itemHeights[key] || itemMinHeight;
      newHeights[key] = height;
    }
    setItemHeights((prev) => ({ ...prev, ...newHeights }));
  }, [startIndex, endIndex]);

  const visibleItems = sortedItems.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100vh', overflowY: 'scroll' }}
    >
      <div style={{ height: `${startIndex * itemMinHeight}px` }} />
      {visibleItems.map((item, index) => {
        const key = itemKey(item);
        const height = itemHeights[key] || itemMinHeight;
        const element = itemRenderer(item, height);
        return (
          <div key={key} style={{ height: `${height}px` }}>
            {element}
          </div>
        );
      })}
      <div
        style={{
          height: `${(sortedItems.length - endIndex) * itemMinHeight}px`,
        }}
      />
    </div>
  );
}

export default MessageList;
