
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Car, CheckCircle, XCircle } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    type: 'access_granted',
    plate: 'ABC-1234',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'success'
  },
  {
    id: 2,
    type: 'access_denied',
    plate: 'XYZ-9876',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'denied'
  },
  {
    id: 3,
    type: 'access_granted',
    plate: 'DEF-5678',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'success'
  }
];

export const EventHistory: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">{event.plate}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Badge
                    variant={event.status === 'success' ? 'default' : 'destructive'}
                  >
                    {event.status === 'success' ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
