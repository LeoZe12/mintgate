
-- 1. Criar extensão pgcrypto (caso não exista)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criar função update_updated_at_column()
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar tabelas vehicle_plates e access_history
CREATE TABLE public.vehicle_plates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate VARCHAR(10) NOT NULL UNIQUE,
  apartment_number VARCHAR(10) NOT NULL,
  owner_name VARCHAR(100),
  vehicle_model VARCHAR(50),
  vehicle_color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.access_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate VARCHAR(10) NOT NULL,
  apartment_number VARCHAR(10),
  access_granted BOOLEAN NOT NULL,
  image_url TEXT,
  confidence_score DECIMAL(3,2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- 4. Aplicar constraints de formato e chave estrangeira
ALTER TABLE public.vehicle_plates
  ADD CONSTRAINT chk_plate_format
  CHECK (plate ~ '^[A-Z0-9]{4,8}$');

ALTER TABLE public.access_history
  ADD CONSTRAINT fk_access_vehicle_plate
  FOREIGN KEY (plate)
  REFERENCES public.vehicle_plates(plate);

-- 5. Criar índices simples e compostos
CREATE INDEX idx_vehicle_plates_plate ON public.vehicle_plates(plate);
CREATE INDEX idx_vehicle_plates_apartment ON public.vehicle_plates(apartment_number);
CREATE INDEX idx_vehicle_plates_active ON public.vehicle_plates(is_active);
CREATE INDEX idx_access_history_timestamp ON public.access_history(timestamp DESC);
CREATE INDEX idx_access_history_plate ON public.access_history(plate);
CREATE INDEX idx_history_apartment_granted ON public.access_history(apartment_number, access_granted);

-- 6. Habilitar RLS e definir policies
ALTER TABLE public.vehicle_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_history ENABLE ROW LEVEL SECURITY;

-- Políticas para vehicle_plates
CREATE POLICY "Allow select vehicle_plates" 
  ON public.vehicle_plates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert vehicle_plates" 
  ON public.vehicle_plates 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow update vehicle_plates" 
  ON public.vehicle_plates 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow delete vehicle_plates" 
  ON public.vehicle_plates 
  FOR DELETE 
  USING (true);

-- Políticas para access_history
CREATE POLICY "Allow select access_history" 
  ON public.access_history 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert access_history" 
  ON public.access_history 
  FOR INSERT 
  WITH CHECK (true);

-- 7. Criar trigger para updated_at
CREATE TRIGGER update_vehicle_plates_updated_at 
  BEFORE UPDATE ON public.vehicle_plates 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Inserir dados de exemplo
INSERT INTO public.vehicle_plates (plate, apartment_number, owner_name, vehicle_model, vehicle_color) VALUES
('ABC1234', '101', 'João Silva', 'Honda Civic', 'Branco'),
('XYZ5678', '202', 'Maria Santos', 'Toyota Corolla', 'Prata'),
('DEF9012', '303', 'Pedro Costa', 'Volkswagen Gol', 'Azul'),
('GHI3456', '404', 'Ana Lima', 'Ford Ka', 'Vermelho'),
('JKL7890', '505', 'Carlos Oliveira', 'Chevrolet Onix', 'Preto'),
('MNO1357', '606', 'Fernanda Rocha', 'Nissan March', 'Branco'),
('PQR2468', '707', 'Roberto Alves', 'Hyundai HB20', 'Azul');
