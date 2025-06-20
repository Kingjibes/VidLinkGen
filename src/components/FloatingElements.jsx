import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FloatingElements = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const generateElements = () => {
      const newElements = [];
      const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
      for (let i = 0; i < 15; i++) {
        newElements.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 60 + 20, 
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * 10 + 15, 
          delay: Math.random() * 5,
        });
      }
      setElements(newElements);
    };

    generateElements();
    const intervalId = setInterval(generateElements, 20000); 
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="floating-elements">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="floating-shape"
          style={{
            left: el.left,
            top: el.top,
            width: `${el.size}px`,
            height: `${el.size}px`,
            backgroundColor: el.color,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
            rotate: [0, Math.random() * 360, 0],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;