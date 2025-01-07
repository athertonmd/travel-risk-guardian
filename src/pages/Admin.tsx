import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Upload, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['risk-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select(`
          *,
          profiles:amended_by (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', session.user.id);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-excel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Risk assessments uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-xs"
          />
          <Button disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Excel"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Information</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Update Date</TableHead>
              <TableHead>Amended by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assessments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No risk assessments found
                </TableCell>
              </TableRow>
            ) : (
              assessments?.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>{assessment.country}</TableCell>
                  <TableCell className="capitalize">{assessment.assessment}</TableCell>
                  <TableCell>{assessment.information}</TableCell>
                  <TableCell>{format(new Date(assessment.created_at), "PPp")}</TableCell>
                  <TableCell>{format(new Date(assessment.updated_at), "PPp")}</TableCell>
                  <TableCell>{assessment.profiles?.email}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;