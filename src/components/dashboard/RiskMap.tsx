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
}

const RiskMap = ({ assessments, searchTerm }: RiskMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { mapboxToken, isLoading, error } = useMapbox();
  
  const { map, sourceLoadedRef } = useMapInitialization(mapContainer, mapboxToken);
  const { handleSearch } = useMapSearch(map, sourceLoadedRef, searchTerm, assessments);
  useMapSetup(map, sourceLoadedRef, assessments, handleSearch);

  return (
    <MapContainer isLoading={isLoading} error={error}>
      <div ref={mapContainer} className="w-full h-full" />
    </MapContainer>
  );
};

export default RiskMap;