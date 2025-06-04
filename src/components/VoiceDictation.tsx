
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToWebhook(audioBlob);
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('🎙️ Enregistrement en cours...');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      toast.error('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      toast.info('📝 Traitement de la dictée en cours...');
    }
  };

  const sendAudioToWebhook = async (audioBlob: Blob) => {
    try {
      // URL du webhook à configurer - pour l'instant on simule une réponse
      const webhookUrl = 'https://example.com/webhook'; // À remplacer par l'URL réelle
      
      // Simulation d'un appel webhook pour la démo
      // Dans un vrai scénario, on enverrait le fichier audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'dictation.wav');

      // Simulation d'une réponse du webhook
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse: DictationResult = {
        motif: 'Douleur abdominale aiguë',
        symptomes: 'Douleur épigastrique irradiant vers le dos, nausées, vomissements',
        examen: 'Abdomen sensible à la palpation, défense musculaire en épigastre',
        antecedents: 'Antécédents de lithiase biliaire, tabagisme'
      };

      onDictationComplete(mockResponse);
      toast.success('✅ Dictée analysée, les champs ont été complétés automatiquement.');
    } catch (error) {
      console.error('Erreur lors de l\'envoi au webhook:', error);
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
