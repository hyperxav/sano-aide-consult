
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
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
      toast.info('📝 Envoi vers le webhook en cours...');
    }
  };

  const sendAudioToWebhook = async (audioBlob: Blob) => {
    try {
      const webhookUrl = 'https://manolox9.app.n8n.cloud/webhook-test/sano-dictee';
      
      // Préparer le FormData avec le fichier audio
      const formData = new FormData();
      formData.append('file', audioBlob, 'dictation.webm');

      console.log('Envoi du fichier audio vers le webhook:', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Réponse du webhook:', result);

      // Traiter la réponse du webhook
      if (result && typeof result === 'object') {
        const dictationResult: DictationResult = {
          motif: result.motif || '',
          symptomes: result.symptomes || '',
          examen: result.examen || '',
          antecedents: result.antecedents || ''
        };

        onDictationComplete(dictationResult);
        toast.success('✅ Dictée analysée, les champs ont été complétés automatiquement.');
      } else {
        toast.warning('⚠️ Réponse du webhook reçue mais format inattendu');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi au webhook:', error);
      toast.error('Erreur lors de l\'envoi de la dictée au webhook');
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
