// Archivo: netlify/functions/analizar.js

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método no permitido" };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    try {
        const body = JSON.parse(event.body);
        const promptUsuario = body.prompt;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        // Carga dinámica obligatoria en Netlify para hacer fetch
        const fetch = (await import('node-fetch')).default;

        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptUsuario }] }]
            })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            return { statusCode: respuesta.status, body: JSON.stringify({ error: data.error.message }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
