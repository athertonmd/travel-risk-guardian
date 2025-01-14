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
  onClientChange: (clientId: string, clientName: string) => void;
}

export const ClientSelector = ({ selectedClientId, onClientChange }: ClientSelectorProps) => {
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

  const handleChange = (clientId: string) => {
    const selectedClient = clients?.find(client => client.id === clientId);
    if (selectedClient) {
      onClientChange(clientId, selectedClient.name);
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