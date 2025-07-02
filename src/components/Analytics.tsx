
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Car, Clock } from 'lucide-react';

const accessData = [
  { name: 'Seg', acessos: 45 },
  { name: 'Ter', acessos: 52 },
  { name: 'Qua', acessos: 38 },
  { name: 'Qui', acessos: 64 },
  { name: 'Sex', acessos: 71 },
  { name: 'Sáb', acessos: 23 },
  { name: 'Dom', acessos: 18 },
];

const hourlyData = [
  { hora: '00', acessos: 2 },
  { hora: '06', acessos: 5 },
  { hora: '08', acessos: 25 },
  { hora: '12', acessos: 18 },
  { hora: '18', acessos: 32 },
  { hora: '22', acessos: 8 },
];

const statusData = [
  { name: 'Permitidos', value: 78, color: '#10b981' },
  { name: 'Negados', value: 22, color: '#ef4444' },
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">311</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+5% em relação a ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Reconhecimento de placa</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acessos por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="acessos" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Padrão de Acessos por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="acessos" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Acessos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Taxa de Sucesso</span>
              <span className="font-bold text-green-600">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tempo Médio de Resposta</span>
              <span className="font-bold">2.3s</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Uptime do Sistema</span>
              <span className="font-bold text-green-600">99.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Última Manutenção</span>
              <span className="font-bold">há 3 dias</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
