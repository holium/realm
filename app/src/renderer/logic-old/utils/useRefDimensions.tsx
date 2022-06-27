import React, { ReactElement, useEffect, useState } from 'react';

export const useRefDimensions = (ref: { current: React.Ref<ReactElement> }) => {
  const [dimensions, setDimensions] = useState({ width: 1, height: 2 });
  useEffect(() => {
    if (ref.current) {
      const { current } = ref;
      const boundingRect = current.getBoundingClientRect();
      const { width, height } = boundingRect;
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    }
  }, [ref]);
  return dimensions;
};
