import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DictationResult {
  motif: string;
  symptomes: string;
  examen: string;
  antecedents: string;
}

interface VoiceDictationProps {
  onDictationComplete: (result: DictationResult) => void;
}

const VoiceDictation: React.FC<VoiceDictationProps> = ({ onDictationComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fonction pour détecter le format audio supporté
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Format audio supporté:', type);
        return type;
      }
    }
    
    return 'audio/webm';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = getSupportedMimeType();
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        await processAudioWithAI(audioBlob);
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('🎙️ Enregistrement en cours...');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Accès au microphone refusé. Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur.');
      } else if (error.name === 'NotFoundError') {
        toast.error('Aucun microphone détecté. Veuillez vérifier qu\'un microphone est connecté.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Enregistrement audio non supporté par votre navigateur.');
      } else {
        toast.error('Impossible d\'accéder au microphone');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      toast.info('🤖 Traitement de l\'audio en cours...');
    }
  };

  const processAudioWithAI = async (audioBlob: Blob) => {
    try {
      // 1. First, transcribe the audio using Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'dictation.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr');

      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Erreur de transcription: ${transcriptionResponse.status}`);
      }

      const transcriptionResult = await transcriptionResponse.json();
      const transcribedText = transcriptionResult.text;

      // 2. Then, analyze the transcription with ChatGPT
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: `Vous êtes un assistant médical expert. Analysez la transcription de la dictée médicale et structurez-la dans les catégories suivantes:
                - motif: le motif principal de la consultation
                - symptomes: la description détaillée des symptômes
                - examen: les résultats de l'examen clinique
                - antecedents: les antécédents médicaux mentionnés
                
                Répondez uniquement avec un objet JSON contenant ces quatre champs, sans autre texte.`
            },
            {
              role: "user",
              content: transcribedText
            }
          ],
          temperature: 0.3
        })
      });

      if (!analysisResponse.ok) {
        throw new Error(`Erreur d'analyse: ${analysisResponse.status}`);
      }

      const analysisResult = await analysisResponse.json();
      const structuredData = JSON.parse(analysisResult.choices[0].message.content);

      // 3. Update the form with the structured data
      onDictationComplete(structuredData);
      toast.success('✅ Dictée analysée avec succès');

    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      toast.error('Erreur lors du traitement de la dictée');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      variant="outline"
      className="w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Traitement...
        </>
      ) : isRecording ? (
        <>
          <Square className="w-4 h-4 mr-2 text-red-500" />
          Arrêter l'enregistrement
        </>
      ) : (
        <>
          🎙️ Dictée vocale
        </>
      )}
    </Button>
  );
};

export default VoiceDictation;
