import React, { useState, useEffect } from 'react';

export const IconDragManager = () => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemPosition, setDraggedItemPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleDrag = (event: any) => {
      setDraggedItemPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('dragover', handleDrag);

    return () => {
      window.removeEventListener('dragover', handleDrag);
    };
  }, []);

  useEffect(() => {
    const handleDrop = () => {
      setDraggedItem(null);
    };

    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleDragStart = (event) => {
    setDraggedItem(event.target.cloneNode(true));
  };

  return (
    <>
      {draggedItem && (
        <div
          style={{
            position: 'fixed',
            top: draggedItemPosition.y,
            left: draggedItemPosition.x,
          }}
        >
          {draggedItem}
        </div>
      )}
    </>
  );
};
