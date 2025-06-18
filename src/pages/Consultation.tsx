
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Mic, Brain, AudioLines } from 'lucide-react';
import { useMedical } from '@/contexts/MedicalContext';
import { Consultation as ConsultationType } from '@/types/medical';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TranscriptionResponse {
  text: string;
}

interface Diagnostic {
  cim10: string;
  libelle: string;
  prob: number;
}

interface StructureResponse {
  motif: string;
  symptomes: string;
  examen: string;
  antecedents: string;
  syntheseSOAP: string;
  news2: string;
  drapeauxRouges: string;
  plan: string;
  diagnostics: Diagnostic[];
  ordonnance: string;
  courrier: string;
  ficheETP: string;
  codeNGAP: string;
  relance: string;
}

const Consultation = () => {
  const { currentConsultation, updateConsultation, analyzeWithAI } = useMedical();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isStructuring, setIsStructuring] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResponse | null>(null);
  const [structureResult, setStructureResult] = useState<StructureResponse | null>(null);

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast.error('Veuillez sélectionner un fichier audio');
      return;
    }

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('https://sano-api-production.up.railway.app/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la transcription');
      }

      const data: TranscriptionResponse = await response.json();
      setTranscriptionResult(data);
      toast.success('Transcription obtenue');
    } catch (error) {
      toast.error('Vérifier la connexion ou la clé API');
      console.error('Transcription Error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStructure = async () => {
    if (!transcriptionResult) {
      toast.error('Veuillez d\'abord effectuer la transcription');
      return;
    }

    setIsStructuring(true);
    try {
      const response = await fetch('https://sano-api-production.up.railway.app/api/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: transcriptionResult.text
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la structuration');
      }

      const data: StructureResponse = await response.json();
      setStructureResult(data);
      toast.success('Synthèse générée');
    } catch (error) {
      toast.error('Vérifier la connexion ou la clé API');
      console.error('Structure Error:', error);
    } finally {
      setIsStructuring(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!structureResult) {
      toast.error('Veuillez d\'abord structurer les données');
      return;
    }

    setIsAnalyzing(true);
    try {
      const consultation: ConsultationType = {
        id: Date.now().toString(),
        patientId: 'temp',
        date: new Date().toISOString(),
        motif: structureResult.motif,
        symptoms: structureResult.symptomes,
        clinicalExam: structureResult.examen
      };

      const analysis = await analyzeWithAI(consultation);
      
      const updatedConsultation = {
        ...consultation,
        aiAnalysis: analysis
      };
      
      updateConsultation(updatedConsultation);
      
      toast.success('Analyse IA terminée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse IA');
      console.error('AI Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation</h1>
          <p className="text-gray-600">Transcription et analyse automatique des consultations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcription et Structuration */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AudioLines className="w-5 h-5" />
              <span>Transcription Audio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="audioInput">Fichier audio de consultation</Label>
              <Input
                id="audioInput"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                id="btnTranscrire"
                onClick={handleTranscribe}
                disabled={isTranscribing || !audioFile}
                variant="outline"
                className="flex-1"
              >
                {isTranscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Transcription...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    🎙 Transcrire
                  </>
                )}
              </Button>

              <Button
                id="btnStructurer"
                onClick={handleStructure}
                disabled={isStructuring || !transcriptionResult}
                className="flex-1 medical-button"
              >
                {isStructuring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Structuration...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    🩺 Structurer
                  </>
                )}
              </Button>
            </div>

            {transcriptionResult && (
              <div>
                <Label>Texte transcrit :</Label>
                <Textarea
                  value={transcriptionResult.text}
                  readOnly
                  className="mt-1 bg-gray-50"
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions et statut */}
        <Card className="medical-card border-medical-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-medical-primary">
              <Brain className="w-5 h-5" />
              <span>Analyse IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Utilisez l'intelligence artificielle pour obtenir une synthèse clinique et des suggestions diagnostiques.
            </p>
            <Button 
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing}
              className="w-full medical-button"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyser avec IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Résultats structurés */}
      {structureResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Synthèse SOAP */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Synthèse SOAP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>S - Motif :</Label>
                <Textarea
                  id="soapMotif"
                  value={`Motif : ${structureResult.motif}`}
                  readOnly
                  className="mt-1 bg-gray-50"
                  rows={2}
                />
              </div>
              <div>
                <Label>S - Symptômes :</Label>
                <Textarea
                  id="soapSymptomes"
                  value={`Symptômes : ${structureResult.symptomes}`}
                  readOnly
                  className="mt-1 bg-gray-50"
                  rows={3}
                />
              </div>
              <div>
                <Label>O - Examen :</Label>
                <Textarea
                  id="soapExamen"
                  value={`Examen : ${structureResult.examen}`}
                  readOnly
                  className="mt-1 bg-gray-50"
                  rows={3}
                />
              </div>
              <div>
                <Label>A/P - Analyse & Plan :</Label>
                <Textarea
                  id="soapDiagPlan"
                  value={`Analyse/Plan : ${structureResult.plan}`}
                  readOnly
                  className="mt-1 bg-gray-50"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Scores et alertes */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Scores & Alertes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge id="news2Label" variant="outline" className="text-sm">
                  NEWS2 : {structureResult.news2}
                </Badge>
              </div>
              <div>
                <Badge id="redFlagsLabel" variant="destructive" className="text-sm">
                  Drapeaux rouges : {structureResult.drapeauxRouges}
                </Badge>
              </div>
              <div>
                <Badge id="ngapLabel" variant="secondary" className="text-sm">
                  Code NGAP : {structureResult.codeNGAP}
                </Badge>
              </div>

              {/* Relance IA */}
              {structureResult.relance !== "Ok" && (
                <Alert id="relanceNotice" className="border-amber-400 bg-amber-50">
                  <AlertDescription className="text-amber-800 font-medium">
                    {structureResult.relance}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diagnostics */}
      {structureResult && structureResult.diagnostics && structureResult.diagnostics.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table id="diagTable">
              <TableHeader>
                <TableRow>
                  <TableHead>CIM-10</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Probabilité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structureResult.diagnostics.map((diagnostic, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{diagnostic.cim10}</TableCell>
                    <TableCell>{diagnostic.libelle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{diagnostic.prob}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Documents générés */}
      {structureResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Ordonnance</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="ordoField"
                value={structureResult.ordonnance}
                readOnly
                className="bg-gray-50"
                rows={6}
              />
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Courrier</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="courrierField"
                value={structureResult.courrier}
                readOnly
                className="bg-gray-50"
                rows={6}
              />
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Fiche Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="etpField"
                value={structureResult.ficheETP}
                readOnly
                className="bg-gray-50"
                rows={6}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Consultation;
