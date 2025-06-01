
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface ConsultationData {
  motif: string;
  symptoms: string;
  clinicalExam: string;
  patientAge?: number;
  patientGender?: string;
}

interface AIAnalysis {
  clinicalSynthesis: string;
  differentialDiagnosis: string[];
  recommendedTreatment: string;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { consultation }: { consultation: ConsultationData } = await req.json()
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construct the prompt for GPT-4o
    const prompt = `
En tant qu'assistant médical expert, analysez cette consultation et fournissez une réponse structurée en JSON.

DONNÉES DE LA CONSULTATION :
- Motif : ${consultation.motif}
- Symptômes : ${consultation.symptoms}
- Examen clinique : ${consultation.clinicalExam || 'Non renseigné'}

Répondez UNIQUEMENT avec un objet JSON valide contenant :
{
  "clinicalSynthesis": "Synthèse clinique format SOAP en français",
  "differentialDiagnosis": ["Diagnostic principal", "Diagnostic différentiel 1", "Diagnostic différentiel 2"],
  "recommendedTreatment": "Recommandations thérapeutiques détaillées",
  "confidence": 0.85
}

Assurez-vous que :
- La synthèse suit le format SOAP (Subjectif, Objectif, Analyse, Plan)
- Les diagnostics sont classés par probabilité décroissante
- Le traitement est adapté et précis
- La confiance est entre 0 et 1
`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un médecin expert français spécialisé dans l\'analyse de consultations médicales. Répondez toujours en JSON valide et en français.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const openaiResult = await response.json()
    const aiResponse = openaiResult.choices[0].message.content

    // Parse the JSON response from GPT-4o
    let analysis: AIAnalysis
    try {
      analysis = JSON.parse(aiResponse)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysis = {
        clinicalSynthesis: `Analyse de la consultation pour : ${consultation.motif}`,
        differentialDiagnosis: [
          'Diagnostic nécessitant une évaluation complémentaire',
          'Syndrome à préciser',
          'Affection bénigne probable'
        ],
        recommendedTreatment: 'Traitement symptomatique et surveillance recommandés',
        confidence: 0.6
      }
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in analyze-consultation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
