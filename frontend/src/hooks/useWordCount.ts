import { useState, useEffect } from 'react';

export const useWordCount = (content: string) => {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const count = content
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    setWordCount(count);
  }, [content]);

  return wordCount;
}; 