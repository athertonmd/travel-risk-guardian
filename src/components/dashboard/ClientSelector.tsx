import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface ClientSelectorProps {
  selectedClientId: string | null;
  onClientChange: (clientId: string, clientName?: string) => void;
  showClearOption?: boolean;
  showAllOption?: boolean;
}

export const ClientSelector = ({ 
  selectedClientId, 
  onClientChange,
  showClearOption,
  showAllOption = false
}: ClientSelectorProps) => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleChange = (value: string) => {
    if (value === 'clear' && showClearOption) {
      onClientChange('');
      return;
    }

    const selectedClient = clients?.find(client => client.id === value);
    if (selectedClient) {
      onClientChange(value, selectedClient.name);
    }
  };

  if (isLoading) return null;

  return (
    <div className="w-[200px] min-w-[200px]">
      <Select
        value={selectedClientId || undefined}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {showClearOption && selectedClientId && (
            <SelectItem value="clear">Clear filter</SelectItem>
          )}
          {clients?.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};