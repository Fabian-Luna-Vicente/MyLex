import { useState, useEffect, useRef } from 'react';

export const useDraggable = (initialTop = 100, initialLeft = 100) => {
  const [position, setPosition] = useState({ top: initialTop, left: initialLeft });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    chrome.storage.local.get(['mylex_fab_position'], (result) => {
      if (result.mylex_fab_position) {
        setPosition(result.mylex_fab_position);
      }
      setIsLoaded(true);
    });
  }, []);

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    offset.current = {
      x: clientX - position.left,
      y: clientY - position.top,
    };
  };

  const handleMove = (clientX, clientY) => {
    if (isDragging) {
      setPosition({
        top: clientY - offset.current.y,
        left: clientX - offset.current.x,
      });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (isLoaded) {
      chrome.storage.local.set({ mylex_fab_position: positionRef.current });
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    bind: {
      onMouseDown: (e) => handleStart(e.clientX, e.clientY),
      onTouchStart: (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY),
      style: {
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'fixed',
        zIndex: 100000,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        visibility: isLoaded ? 'visible' : 'hidden'
      }
    }
  };
};