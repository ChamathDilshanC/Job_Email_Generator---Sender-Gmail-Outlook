'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string | string[];
  speed?: number; // milliseconds per character
  delay?: number; // delay before starting
  loop?: boolean; // loop through texts
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 100,
  delay = 0,
  loop = true,
  className = '',
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const texts = Array.isArray(text) ? text : [text];

  useEffect(() => {
    const currentText = texts[currentTextIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentIndex < currentText.length) {
            setDisplayText(currentText.substring(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else {
            // Finished typing current text
            if (onComplete) onComplete();

            // Wait before deleting (if looping)
            if (loop && texts.length > 1) {
              setTimeout(() => setIsDeleting(true), 1500);
            }
          }
        } else {
          // Deleting
          if (currentIndex > 0) {
            setDisplayText(currentText.substring(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            // Finished deleting, move to next text
            setIsDeleting(false);
            setCurrentTextIndex((currentTextIndex + 1) % texts.length);
          }
        }
      },
      currentIndex === 0 ? delay : isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    currentTextIndex,
    isDeleting,
    texts,
    speed,
    delay,
    loop,
    onComplete,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Custom hook for using typewriter in input placeholders
export function useTypewriter(
  texts: string | string[],
  speed = 100,
  loop = true
): string {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const textArray = Array.isArray(texts) ? texts : [texts];

  useEffect(() => {
    const currentText = textArray[currentTextIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText(currentText.substring(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else if (loop && textArray.length > 1) {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          if (currentIndex > 0) {
            setDisplayText(currentText.substring(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            setIsDeleting(false);
            setCurrentTextIndex((currentTextIndex + 1) % textArray.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [currentIndex, currentTextIndex, isDeleting, textArray, speed, loop]);

  return displayText;
}
