import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene la configuración necesaria para Wompi (como la clave pública)
 * desde nuestro propio backend.
 */
export const getWompiConfig = async (): Promise<{ wompiPublicKey: string }> => {
    try {
        const response = await axios.get(`${API_BASE_URL}config`);
        return response.data.data;
    } catch (error) {
        console.error("Error obteniendo la configuración de Wompi:", error);
        throw new Error("No se pudo obtener la configuración del servidor.");
    }
};

/**
 * Solicita al backend que genere una firma de integridad para la transacción.
 */
export const getSignature = async (
    reference: string,
    amountInCents: number,
    currency: string = "COP"
): Promise<string> => {
    try {
        const response = await axios.post<{ signature: string }>(
            `${API_BASE_URL}wompi/generate-signature`,
            {
                reference,
                amountInCents,
                currency,
            }
        );
        return response.data.signature;
    } catch (error: unknown) {
        console.error("Error obteniendo la firma:", error);
        throw new Error("No se pudo obtener la firma de Wompi");
    }
};

/**
 * Envía los datos del formulario al backend para crear un registro en estado "pendiente".
 */
export const createPendingInscription = async (payload: any): Promise<any> => {
    try {
        const response = await axios.post(`${API_BASE_URL}inscriptions/register`, payload);
        return response.data;

    } catch (error: unknown) {
        console.error("Error al registrar:", error);
        throw new Error("No se pudo registrar la información");
    }
};
