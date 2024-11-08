// src/components/TooltipInfo.js
'use client';

import React from 'react';
import './TooltipInfo.css'; // Archivo CSS para estilos personalizados

const TooltipInfo = ({ data, position, title }) => {
  if (!data) return null;

  return (
    <div
      className="tooltip-info"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <h4>{title}</h4>
      {Object.entries(data).map(([key, value]) => (
        <p key={key}>
          <strong>{key.replace(/_/g, ' ')}:</strong> {value}
        </p>
      ))}
    </div>
  );
};

export default TooltipInfo;
