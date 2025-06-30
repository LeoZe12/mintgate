
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Download } from 'lucide-react';

interface Event {
  id: string;
  timestamp: string;
  event_type: string;
  description: string;
  status: 'success' | 'error' | 'warning';
}

export const EventHistory: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['event-history'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('esp32_status_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        timestamp: item.created_at,
        event_type: item.status,
        description: `Status alterado para ${item.status}`,
        status: item.status === 'connected' ? 'success' : item.status === 'error' ? 'error' : 'warning'
      }));
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const exportHistory = () => {
    if (!events) return;
    
    const csv = [
      'Timestamp,Tipo,Descrição,Status',
      ...events.map(event => 
        `${formatTimestamp(event.timestamp)},${event.event_type},${event.description},${event.status}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esp32-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Eventos
          </span>
          <Button
            onClick={exportHistory}
            variant="outline"
            size="sm"
            disabled={!events || events.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Carregando histórico...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                    <TableCell className="capitalize">{event.event_type}</TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum evento encontrado no histórico
          </div>
        )}
      </CardContent>
    </Card>
  );
};
