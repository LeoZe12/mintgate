
import React from 'react';
import { Esp32Status } from '@/components/Esp32Status';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Sistema de Controle ESP32
        </h1>
        
        <div className="flex justify-center">
          <Esp32Status />
        </div>
      </div>
    </div>
  );
};

export default Index;
