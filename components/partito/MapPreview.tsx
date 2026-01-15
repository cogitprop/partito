import React from 'react';

interface MapPreviewProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ latitude, longitude, address }) => {
  if (!latitude || !longitude) return null;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="rounded-lg overflow-hidden border border-warm-gray-100">
      <iframe
        src={mapUrl}
        width="100%"
        height="200"
        className="border-0 block"
        title="Event location"
        loading="lazy"
      />
      <div className="p-2 bg-warm-gray-50 text-xs text-warm-gray-500">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};
