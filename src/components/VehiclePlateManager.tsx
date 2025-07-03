
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Car, Edit2, Trash2, Search } from 'lucide-react';
import { useVehiclePlates, type VehiclePlateInsert } from '@/hooks/useVehiclePlates';
import { useToast } from '@/hooks/use-toast';

export const VehiclePlateManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlate, setNewPlate] = useState<VehiclePlateInsert>({
    plate: '',
    apartment_number: '',
    owner_name: '',
    vehicle_model: '',
    vehicle_color: '',
  });

  const { plates, isLoading, addPlate, removePlate, isAddingPlate, isRemovingPlate } = useVehiclePlates();
  const { toast } = useToast();

  const handleAddPlate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlate.plate || !newPlate.apartment_number) {
      toast({
        title: "Erro",
        description: "Placa e número do apartamento são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPlate(newPlate);
      
      toast({
        title: "Sucesso",
        description: "Placa cadastrada com sucesso!",
      });

      // Reset form
      setNewPlate({
        plate: '',
        apartment_number: '',
        owner_name: '',
        vehicle_model: '',
        vehicle_color: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao adicionar placa:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar placa. Verifique se a placa já não está cadastrada.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlate = async (id: string, plate: string) => {
    if (confirm(`Tem certeza que deseja remover a placa ${plate}?`)) {
      try {
        await removePlate(id);
        toast({
          title: "Sucesso",
          description: "Placa removida com sucesso!",
        });
      } catch (error) {
        console.error('Erro ao remover placa:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover placa.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredPlates = plates.filter(plate => 
    plate.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plate.apartment_number.includes(searchTerm) ||
    (plate.owner_name && plate.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando placas cadastradas...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Gerenciamento de Placas
          </CardTitle>
          <CardDescription>
            Cadastre e gerencie as placas autorizadas do condomínio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buscar Placas */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, apartamento ou proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Placa
            </Button>
          </div>

          {/* Formulário de Adicionar Placa */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cadastrar Nova Placa</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPlate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plate">Placa *</Label>
                      <Input
                        id="plate"
                        value={newPlate.plate}
                        onChange={(e) => setNewPlate({ ...newPlate, plate: e.target.value.toUpperCase() })}
                        placeholder="ABC1234"
                        maxLength={8}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="apartment">Apartamento *</Label>
                      <Input
                        id="apartment"
                        value={newPlate.apartment_number}
                        onChange={(e) => setNewPlate({ ...newPlate, apartment_number: e.target.value })}
                        placeholder="101"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="owner">Proprietário</Label>
                      <Input
                        id="owner"
                        value={newPlate.owner_name || ''}
                        onChange={(e) => setNewPlate({ ...newPlate, owner_name: e.target.value })}
                        placeholder="Nome do proprietário"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="model">Modelo do Veículo</Label>
                      <Input
                        id="model"
                        value={newPlate.vehicle_model || ''}
                        onChange={(e) => setNewPlate({ ...newPlate, vehicle_model: e.target.value })}
                        placeholder="Honda Civic"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="color">Cor</Label>
                      <Input
                        id="color"
                        value={newPlate.vehicle_color || ''}
                        onChange={(e) => setNewPlate({ ...newPlate, vehicle_color: e.target.value })}
                        placeholder="Branco"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isAddingPlate}>
                      {isAddingPlate ? 'Cadastrando...' : 'Cadastrar Placa'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Lista de Placas */}
      <Card>
        <CardHeader>
          <CardTitle>Placas Cadastradas ({filteredPlates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'Nenhuma placa encontrada com os filtros aplicados.' : 'Nenhuma placa cadastrada ainda.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPlates.map((plate) => (
                <div key={plate.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                        {plate.plate}
                      </Badge>
                      <Badge>Apto {plate.apartment_number}</Badge>
                      {plate.is_active && <Badge variant="default" className="bg-green-500">Ativa</Badge>}
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePlate(plate.id, plate.plate)}
                      disabled={isRemovingPlate}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {(plate.owner_name || plate.vehicle_model || plate.vehicle_color) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        {plate.owner_name && (
                          <div>
                            <span className="text-muted-foreground">Proprietário: </span>
                            <span>{plate.owner_name}</span>
                          </div>
                        )}
                        {plate.vehicle_model && (
                          <div>
                            <span className="text-muted-foreground">Modelo: </span>
                            <span>{plate.vehicle_model}</span>
                          </div>
                        )}
                        {plate.vehicle_color && (
                          <div>
                            <span className="text-muted-foreground">Cor: </span>
                            <span>{plate.vehicle_color}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
