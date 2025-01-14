import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const NotificationTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Date Sent</TableHead>
        <TableHead>Recipient Status</TableHead>
        <TableHead>CC Status</TableHead>
        <TableHead>Recipient</TableHead>
        <TableHead>CC</TableHead>
        <TableHead>Traveller</TableHead>
        <TableHead>Country</TableHead>
        <TableHead>Risk Level</TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Sent By</TableHead>
      </TableRow>
    </TableHeader>
  );
};