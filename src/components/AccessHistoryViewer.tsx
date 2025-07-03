
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { History, CheckCircle, XCircle, Search, Calendar } from 'lucide-react';
import { useAccessHistory } from '@/hooks/useAccessHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AccessHistoryViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { accessHistory, isLoading } = useAccessHistory();

  const filteredHistory = accessHistory.filter(entry => 
    entry.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.apartment_number && entry.apartment_number.includes(searchTerm))
  );

  const getStatusIcon = (accessGranted: boolean) => {
    return accessGranted ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (accessGranted: boolean) => {
    return accessGranted ? (
      <Badge variant="default" className="bg-green-500">Autorizado</Badge>
    ) : (
      <Badge variant="destructive">Negado</Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando histórico de acessos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Acessos
        </CardTitle>
        <CardDescription>
          Visualize o histórico completo de tentativas de acesso
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buscar no Histórico */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa ou apartamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <p className="text-2xl font-bold">{accessHistory.length}</p>
            <p className="text-sm text-muted-foreground">Total de Tentativas</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {accessHistory.filter(entry => entry.access_granted).length}
            </p>
            <p className="text-sm text-muted-foreground">Acessos Autorizados</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {accessHistory.filter(entry => !entry.access_granted).length}
            </p>
            <p className="text-sm text-muted-foreground">Acessos Negados</p>
          </div>
        </div>

        <Separator />

        {/* Lista do Histórico */}
        {filteredHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? 'Nenhum registro encontrado com os filtros aplicados.' : 'Nenhum registro de acesso ainda.'}
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(entry.access_granted)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {entry.plate}
                        </Badge>
                        {entry.apartment_number && (
                          <Badge variant="secondary">
                            Apto {entry.apartment_number}
                          </Badge>
                        )}
                        {getStatusBadge(entry.access_granted)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(entry.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    {entry.confidence_score && (
                      <div className="text-sm text-muted-foreground">
                        Confiança: {(entry.confidence_score * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                
                {entry.reason && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Motivo: </span>
                      <span>{entry.reason}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
