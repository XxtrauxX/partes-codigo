// src/components/PaymentForm.tsx
import React, { useState } from 'react';
import { useWompiPayment } from '../hooks/useWompiPayment';

interface PaymentFormProps {
  product: {
    type: string;
    name: string;
    priceInCents: number;
    selected_course: string; // Aseguramos que el producto siempre tenga una fecha
  };
}

const PaymentForm: React.FC<PaymentFormProps> = ({ product }) => {
  const { initializePayment, isLoading, error, isReady } = useWompiPayment();
  const [formData, setFormData] = useState({ name: '', lastname: '', email: '', phone: '', document: '' });
  
  const isFormValid = formData.name.trim() !== '' && formData.lastname.trim() !== '' && formData.email.trim() !== '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentRequest = () => {
    if (!isFormValid) return;

    const paymentData = {
      amountInCents: product.priceInCents,
      userData: {
        product_type: product.type,
        product_name: product.name,
        
        selected_course: product.selected_course, 
        ...formData,
      },
    };
    initializePayment(paymentData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-left space-y-4 max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-4">Completa tus datos para inscribirte</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Apellido</label>
            <input type="text" name="lastname" id="lastname" value={formData.lastname} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
        </div>
         <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700">Documento</label>
          <input type="text" name="document" id="document" value={formData.document} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
        </div>
        
        <button 
          onClick={handlePaymentRequest}
          disabled={isLoading || !isReady || !isFormValid}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {isLoading ? "Procesando..." : (isReady ? `Pagar ${(product.priceInCents / 100).toLocaleString('es-CO', {style: 'currency', currency: 'COP'})}` : "Cargando...")}
        </button>
        
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default PaymentForm;
