// Lista de dominios autorizados para comunicarse el backend
const whitelist = [
    
    'http://localhost:4321', // Puerto original de Astro
    'http://localhost:4322', //  Nuevo puerto que está usando tu frontend
    'http://localhost:5173', // Puerto del Admin 


    process.env.FRONTEND_LANDING_URL,
    process.env.FRONTEND_ADMIN_URL
];

const corsOptions = {
    origin: function (origin, callback) {
        
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Acceso no permitido por la política de CORS'));
        }
    },
    credentials: true
};

module.exports = corsOptions;
