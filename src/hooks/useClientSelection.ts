import { useState } from 'react';

const STORAGE_KEY = 'lastSelectedClient';

interface StoredClientData {
  id: string;
  name: string;
}

export const useClientSelection = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as StoredClientData;
      return parsedData.id;
    }
    return null;
  });

  const [selectedClientName, setSelectedClientName] = useState<string | null>(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as StoredClientData;
      return parsedData.name;
    }
    return null;
  });

  const handleClientChange = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: clientId, name: clientName }));
  };

  return {
    selectedClientId,
    selectedClientName,
    handleClientChange,
  };
};