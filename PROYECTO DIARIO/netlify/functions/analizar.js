// Archivo: netlify/functions/analizar.js

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método no permitido" };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    try {
        const body = JSON.parse(event.body);
        const texto = body.texto;
        const tareas = body.tareas;
        const objetivo = body.objetivo;
        const perfil = body.perfil;

        // EL PROMPT MAESTRO DINÁMICO (El "Cerebro" de Kyros)
        let prompt = `Actúa como el coach de alto rendimiento y disciplina personal de ${perfil.nombre}.
Perfil de tu cliente:
- Edad: ${perfil.edad ? perfil.edad + ' años' : 'Desconocida'}
- Sexo: ${perfil.sexo || 'No especificado'}
- Meta principal actual: "${objetivo || 'Mejorar su disciplina y constancia diaria'}"

Instrucciones: Analiza estrictamente su registro de hoy cruzándolo con sus tareas. Ten en cuenta su EDAD y su META PRINCIPAL para adaptar tu tono, tus críticas y tu nivel de exigencia. Un chico de 19 años buscando ganar músculo no requiere el mismo consejo que una persona de 50 años buscando salud.

Tareas de hoy:
${tareas || 'Ninguna tarea planificada.'}

Diario de hoy: "${texto}"

Devuelve ÚNICAMENTE un JSON válido (sin formato markdown ni tildes en las keys): 
{"veredicto":"POSITIVO|NEGATIVO|NEUTRO","disciplina":8,"enfoque":7,"constancia":9,"progreso_objetivo":15,"insight":"Crítica constructiva de 1 línea adaptada a su edad, sexo y meta."}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        // CERO LÍNEAS DE NODE-FETCH. USAMOS FETCH NATIVO DIRECTAMENTE.
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
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
