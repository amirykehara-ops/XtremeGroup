import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
server: {
      port: 5173,
      host: '0.0.0.0',
      allowedHosts: [
        "zaiden-matted-nonbotanically.ngrok-free.dev"
      ]
    },
    plugins: [
      react(),
      {
        name: 'mercado-pago-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/create-preference' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              
              req.on('end', async () => {
                try {
                  const parsedBody = JSON.parse(body);
                  
                  const preferenceBody = {
                    items: parsedBody.items,
                    payer: {
                      // Esto genera un email diferente cada vez que reinicias, 
                      // así Mercado Pago no reconoce al "comprador de prueba" de hace un rato.
                      email: `test_user_${Math.floor(Math.random() * 100000)}@testuser.com` 
                    },
                    back_urls: {
                      success: "https://zaiden-matted-nonbotanically.ngrok-free.dev/#/payment-success",
                      failure: "https://zaiden-matted-nonbotanically.ngrok-free.dev/#/payment-failed",
                      pending: "https://zaiden-matted-nonbotanically.ngrok-free.dev/#/payment-failed"
                    },
                    //back_url: {
                    //  success: "https://www.google.com"
                    //},   
                    
                    auto_return: "approved",
                    binary_mode: true,
                    statement_descriptor: "XTREMEGROUP"
                  };

                  const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                      // Usa tu Token de PRUEBA aquí (el que empieza con TEST- o APP_USR- pero sacado de la pestaña PRUEBAS)
                      'Authorization': 'Bearer APP_USR-1133073234382866-121813-e926fc66956426e53dd401bb758c8722-3070440284',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(preferenceBody),
                  });

                  const data = await mpResponse.json();
                  res.setHeader('Content-Type', 'application/json');
                  
                  if (mpResponse.ok) {
                    res.end(JSON.stringify(data));
                  } else {
                    console.error("DETALLE DEL ERROR MP:", JSON.stringify(data, null, 2));
                    res.statusCode = 400;
                    res.end(JSON.stringify(data));
                  }
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Error interno' }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});