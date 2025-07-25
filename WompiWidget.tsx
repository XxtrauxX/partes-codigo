import React, { useEffect, useState } from 'react';
import { getSignature, createPendingInscription } from '../../data/wompiService';

// --- INTERFACES Y DECLARACIONES ---
interface WompiWidgetProps {
  amountInCents: number;
  formData: any;
  onTransactionSuccess?: (transaction: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    WidgetCheckout: new (config: any) => { open: (callback: (result: any) => void) => void };
  }
}

// --- COMPONENTE ---
const WompiWidget: React.FC<WompiWidgetProps> = ({
  amountInCents,
  formData,
  onTransactionSuccess,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  
  const WOMPI_PUBLIC_KEY = import.meta.env.PUBLIC_WOMPI_PUBLIC_KEY as string;

  const initializePayment = async () => {
    console.log("Paso 1: Iniciando el proceso de pago...");
    setIsLoading(true);

    try {
     
      if (!WOMPI_PUBLIC_KEY) {
        console.error("Error Crítico: La clave pública de Wompi (PUBLIC_WOMPI_PUBLIC_KEY) no está definida. Revisa tu archivo .env y reinicia el servidor.");
        setIsLoading(false);
        return;
      }

      if (isNaN(amountInCents) || amountInCents <= 0) {
        console.error("Error Crítico: El monto no es válido", amountInCents);
        setIsLoading(false);
        return;
      }
      console.log("Paso 2: El monto es válido:", amountInCents);

      const reference = `ia_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      const payload = { ...formData, reference };

      console.log("Paso 3: Creando inscripción pendiente en el backend...");
      await createPendingInscription(payload);
      console.log("Paso 4: Inscripción pendiente creada exitosamente.");

      console.log("Paso 5: Solicitando firma de pago al backend...");
      const signature = await getSignature(reference, amountInCents, 'COP');
      console.log("Paso 6: Firma recibida del backend:", signature);

      if (typeof window.WidgetCheckout === 'undefined' || !window.WidgetCheckout) {
        console.error("Error Crítico: El script de Wompi (WidgetCheckout) no se ha cargado.");
        setIsLoading(false);
        return;
      }
      console.log("Paso 7: El objeto WidgetCheckout de Wompi está disponible.");

      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents,
        reference,
        publicKey: WOMPI_PUBLIC_KEY,
        redirectUrl: `${window.location.origin}/pago-exitoso`,
        'signature:integrity': signature,
      });
      
      console.log("Paso 8: Widget de Wompi configurado. Abriendo ahora...");
      checkout.open(async (result: any) => {
        console.log("Paso 9: El widget se ha cerrado o ha completado una transacción. Resultado:", result);
        const { transaction } = result;

        if (transaction && transaction.status === "APPROVED") {
          console.log("¡ÉXITO! Pago APROBADO.");
          if (onTransactionSuccess) {
            onTransactionSuccess(transaction);
          }
        } else {
          console.error("Pago NO aprobado o cancelado. Estado:", transaction?.status);
          setIsLoading(false);
        }
      });

    } catch (error) {
      console.error('Error catastrófico durante la inicialización del pago:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <button
      onClick={initializePayment}
      disabled={disabled || isLoading}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isLoading ? 'Procesando...' : 'Paga Ahora con Wompi'}
    </button>
  );
};

export default WompiWidget;
