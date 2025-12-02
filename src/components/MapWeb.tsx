import React from 'react';

type Local = {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
};

interface MapProps {
  locales: Local[];
}

export default function MapWeb({ locales }: MapProps) {
  return (
    <div
      style={{
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#e0e0e0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <p>El mapa no está disponible en la versión web.</p>
    </div>
  );
}
