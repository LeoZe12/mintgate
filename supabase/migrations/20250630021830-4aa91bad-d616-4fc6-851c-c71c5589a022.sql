
-- Criar tabela para histórico de status do ESP32
CREATE TABLE public.esp32_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32_main',
  status TEXT NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  is_loading BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do ESP32
CREATE TABLE public.esp32_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32_main',
  config_key TEXT NOT NULL,
  config_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(device_id, config_key)
);

-- Criar índices para performance
CREATE INDEX idx_esp32_status_device_id ON public.esp32_status_history(device_id);
CREATE INDEX idx_esp32_status_created_at ON public.esp32_status_history(created_at DESC);
CREATE INDEX idx_esp32_config_device_key ON public.esp32_config(device_id, config_key);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.esp32_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esp32_config ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS - permitir acesso público para este caso de uso
CREATE POLICY "Allow public access to esp32_status_history" 
  ON public.esp32_status_history 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public access to esp32_config" 
  ON public.esp32_config 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamp
CREATE TRIGGER update_esp32_status_history_updated_at 
  BEFORE UPDATE ON public.esp32_status_history 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_esp32_config_updated_at 
  BEFORE UPDATE ON public.esp32_config 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
