
import React from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
}

const Card3D: React.FC<Card3DProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-x-3 hover:rotate-y-2 ${className}`}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

export default Card3D;
