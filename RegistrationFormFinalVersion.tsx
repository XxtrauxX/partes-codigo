import React, { useState } from 'react';


declare global {
  interface Window {
    handleWompiPayment: () => void;
  }
}

export default function RegistrationForm() {
  const [isFormValid, setIsFormValid] = useState(false);

  
  const validateForm = () => {
    const form = document.getElementById('registration-form') as HTMLFormElement;
    if (form) {
      const formData = new FormData(form);
      const userData = Object.fromEntries(formData.entries());
      const isValid = !!(userData.name && userData.lastname && userData.email && userData.phone && userData.document && userData.targetDate);
      setIsFormValid(isValid);
    }
  };

  return (
    <form id="registration-form" className="mx-auto max-w-md" onChange={validateForm}>
      <div className="space-y-6 bg-white/5 p-8 rounded-xl border border-purple-500/20">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Inscríbete Ahora</h3>
          <p className="text-purple-300">Completa los datos y realiza el pago</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">¿Qué fecha seleccionas?</label>
          <select name="targetDate" required className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white" defaultValue="">
            <option value="" disabled>Selecciona una fecha</option>
            <option value="2025-03-15">15 de marzo de 2025 - Bucaramanga</option>
            <option value="2025-03-22">22 de marzo de 2025 - Bucaramanga</option>
            <option value="2025-03-29">29 de marzo de 2025 - Bucaramanga</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="block text-sm font-medium text-white/80">Nombre</label><input type="text" name="name" required placeholder="Ej: Juan" className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white" /></div>
          <div className="space-y-2"><label className="block text-sm font-medium text-white/80">Apellido</label><input type="text" name="lastname" required placeholder="Ej: Pérez" className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white" /></div>
        </div>
        <div className="space-y-2"><label className="block text-sm font-medium text-white/80">Email</label><input type="email" name="email" required placeholder="correo@ejemplo.com" className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white" /></div>
        <div className="space-y-2"><label className="block text-sm font-medium text-white/80">Celular</label><input type="tel" name="phone" required placeholder="+57 300 123 4567" className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white" /></div>
        <div className="space-y-2"><label className="block text-sm font-medium text-white/80">Número de documento</label><input type="text" name="document" required placeholder="Tu número de cédula" className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white" /></div>
        
        <button
          id="wompi-button"
          type="button"
          onClick={() => window.handleWompiPayment && window.handleWompiPayment()}
          disabled={!isFormValid}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Paga Ahora con Wompi
        </button>
      </div>
    </form>
  );
}
