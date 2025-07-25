// src/services/wompi.service.js
const crypto = require('crypto');
const InscriptionModel = require('../models/inscription.model');
const WebhookLogModel = require('../models/webhooklog.model');
const { sendWelcomeEmail, sendNotificationEmail } = require('./email.service');

const WompiService = {
  
    generateSignature: (reference, amountInCents, currency) => {
        const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
        if (!integrityKey) {
            throw new Error("WOMPI_INTEGRITY_KEY no está configurada.");
        }
        const stringToSign = `${reference}${amountInCents}${currency}${integrityKey}`;
        return crypto.createHash('sha256').update(stringToSign, 'utf8').digest('hex');
    },

    /**
     * Valida la firma del webhook, revisa duplicados y extrae los datos.
     * @param {object} event - El cuerpo completo del evento webhook de Wompi.
     * @returns {Promise<object>} Un objeto con los datos procesados o un error.
     */
    checkWebHook: async (event) => {
        const secret = process.env.WOMPI_EVENTS_SECRET;

       
        if (!event?.signature?.properties || !event?.timestamp || !event?.signature?.checksum) {
            return { code: 400, error: "Faltan datos en la firma del webhook para la validación." };
        }

        const { properties, checksum: wompiChecksum } = event.signature;
        const timestamp = event.timestamp;
        let concatenatedProperties = "";

        // Construimos la cadena a partir de las propiedades que Wompi indica
        for (const prop of properties) {
            
            const value = prop.split('.').reduce((o, i) => o?.[i], event.data);
            if (value === undefined) {
                return { code: 400, error: `La propiedad de firma '${prop}' no fue encontrada en los datos del evento.` };
            }
            concatenatedProperties += value;
        }

        const stringToSign = `${concatenatedProperties}${timestamp}${secret}`;
        
        const localChecksum = crypto.createHash("sha256").update(stringToSign, "utf8").digest("hex");

        if (wompiChecksum !== localChecksum) {
            console.warn("ALERTA DE SEGURIDAD: Checksum de webhook inválido. Posible intento de suplantación.");
            return { code: 403, error: "Checksum inválido. La notificación no es auténtica." };
        }
        // --- FIN DE LA VALIDACIÓN DE CHECKSUM ---

        const { id: transactionId, reference, status, amount_in_cents, customer_email, payment_method_type, finalized_at } = event.data.transaction;

        if (!transactionId || !reference || !status) {
            return { code: 400, error: "Datos de transacción incompletos en el webhook." };
        }

        const existingEvent = await WebhookLogModel.findByTransaction(transactionId, reference);
        if (existingEvent) {
            console.log(`Webhook duplicado para transacción ${transactionId}. Omitiendo.`);
            return { code: 200, error: "Evento duplicado." };
        }

        await WebhookLogModel.create({
            eventType: event.event,
            environment: event.environment,
            transactionId,
            reference,
            status,
            payload: event,
            checksum: wompiChecksum
        });

        return {
            reference,
            status,
            amount: amount_in_cents / 100,
            customerEmail: customer_email,
            paymentMethod: payment_method_type,
            customerData: event.data.transaction.customer_data || {},
            finalizedAt: finalized_at
        };
    },


     
    processWebhookAI: async (processedWebhook) => {
        const { reference, finalizedAt, amount, customerEmail, paymentMethod, customerData } = processedWebhook;

        console.log(`Pago aprobado para referencia: ${reference}. Actualizando inscripción y enviando correos...`);
        const updatedInscription = await InscriptionModel.updateStatus(reference, finalizedAt, amount);

        if (updatedInscription) {
            await sendWelcomeEmail(customerEmail, customerData.full_name, updatedInscription.selected_course);

            const notifData = {
                email: customerEmail,
                username: customerData.full_name,
                phone: customerData.phone_number,
                documentNumber: updatedInscription.document,
                paymentMethod,
                amount,
                contactEmail: "admin@tuempresa.com", // Cambia este correo
                selected_course: updatedInscription.selected_course,
            };
            await sendNotificationEmail(notifData);
        }
    }
};

module.exports = WompiService;
