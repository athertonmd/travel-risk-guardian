import React, { useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapbox } from "@/hooks/useMapbox";
import { MapContainer } from "@/components/map/MapContainer";
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useMapSearch } from '@/hooks/useMapSearch';
import { useMapSetup } from '@/hooks/useMapSetup';

export interface RiskAssessment {
  id: string;
  country: string;
  assessment: "low" | "medium" | "high" | "extreme";
  information: string;
}

interface RiskMapProps {
  assessments: RiskAssessment[];
  searchTerm: string;
  onCountryClick?: (country: string) => void;
}

const RiskMap = ({ assessments, searchTerm, onCountryClick }: RiskMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapboxToken, isLoading, error } = useMapbox();
  
  const { map, sourceLoadedRef } = useMapInitialization(mapContainer, mapboxToken);
  const { handleSearch } = useMapSearch(map, sourceLoadedRef, searchTerm, assessments);
  useMapSetup(map, sourceLoadedRef, assessments, handleSearch, onCountryClick);

  if (isLoading) {
    return (
      <MapContainer isLoading={true}>
        <div ref={mapContainer} className="w-full h-full" />
      </MapContainer>
    );
  }

  if (error) {
    return (
      <MapContainer error={error}>
        <div ref={mapContainer} className="w-full h-full" />
      </MapContainer>
    );
  }

  return (
    <MapContainer>
      <div ref={mapContainer} className="w-full h-full" />
    </MapContainer>
  );
};

export default RiskMap;