
const WompiController = {
    generateSignature: (req, res, next) => {
        try {
            const { reference, amountInCents, currency } = req.body;
            if (!reference || !amountInCents || !currency) {
                const error = new Error("Faltan datos requeridos para generar la firma.");
                error.statusCode = 400;
                throw error;
            }
            const signature = WompiService.generateSignature(reference, amountInCents, currency);
            res.status(200).json({ signature });
        } catch (error) {
            next(error);
        }
    },

    receiveWebhook: async (req, res, next) => {
        try {
            console.log("Webhook de Wompi recibido:", JSON.stringify(req.body, null, 2));
            const event = req.body;

            // 1. Validar y registrar el webhook
            const processedWebhook = await WompiService.checkWebHook(event);

            // 2. Manejar respuestas de validación 
            if (processedWebhook.code && processedWebhook.error) {
                return res.status(processedWebhook.code).json({ message: processedWebhook.error });
            }

            // 3. Actuar solo si el pago fue aprobado
            if (processedWebhook.status === "APPROVED") {
                // 4. Enrutar según el tipo de referencia
                if (processedWebhook.reference.startsWith("ia_")) {
                    console.log("Procesando Webhook para Curso de IA.");
                    await WompiService.processWebhookAI(processedWebhook);
                }
                
            }

            return res.status(200).json({ received: true, message: "Webhook procesado exitosamente" });
        } catch (error) {
            next(error); // Pasar cualquier error inesperado a nuestro manejador central
        }
    }
};

module.exports = WompiController;
