
import React, { useEffect, useState } from 'react';

const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 15,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? '#3b82f6' : '#ef4444',
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="floating-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.animationDelay}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            boxShadow: `0 0 10px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
