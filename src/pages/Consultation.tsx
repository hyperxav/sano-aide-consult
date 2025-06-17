
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Mic, Brain } from 'lucide-react';
import { useMedical } from '@/contexts/MedicalContext';
import { Consultation as ConsultationType } from '@/types/medical';
import { toast } from 'sonner';
import VoiceDictation from '@/components/VoiceDictation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DictationResult {
  motif: string;
  symptomes: string;
  examen: string;
  antecedents: string;
}

const Consultation = () => {
  const { currentConsultation, updateConsultation, analyzeWithAI } = useMedical();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [responseStructure, setResponseStructure] = useState<DictationResult | null>(null);
  const [iaQuestion, setIaQuestion] = useState<string>("");
  const [showIaQuestion, setShowIaQuestion] = useState<boolean>(false);
  const [isLoadingRelance, setIsLoadingRelance] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    patientName: '',
    motif: '',
    symptoms: '',
    clinicalExam: '',
    antecedents: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDictationComplete = async (result: DictationResult) => {
    setFormData(prev => ({
      ...prev,
      motif: result.motif,
      symptoms: result.symptomes,
      clinicalExam: result.examen,
      antecedents: result.antecedents
    }));
    setResponseStructure(result);
    
    // Appeler l'API de relance après avoir structuré les données
    await handleRelanceIA(result);
  };
  
  const handleRelanceIA = async (data: DictationResult) => {
    setIsLoadingRelance(true);
    try {
      const response = await fetch('https://sano-api-production.up.railway.app/api/relance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motif: data.motif,
          symptomes: data.symptomes,
          examen: data.examen,
          antecedents: data.antecedents
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la relance IA');
      }
      
      const responseData = await response.json();
      setIaQuestion(responseData.question);
      
      // Afficher ou masquer selon la réponse
      if (responseData.question === "Ok") {
        setShowIaQuestion(false);
      } else {
        setShowIaQuestion(true);
      }
    } catch (error) {
      toast.error('Erreur lors de la relance IA');
      console.error('Relance IA Error:', error);
    } finally {
      setIsLoadingRelance(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!formData.motif || !formData.symptoms) {
      toast.error('Veuillez remplir au moins le motif et les symptômes');
      return;
    }

    setIsAnalyzing(true);
    try {
      const consultation: ConsultationType = {
        id: Date.now().toString(),
        patientId: 'temp',
        date: new Date().toISOString(),
        motif: formData.motif,
        symptoms: formData.symptoms,
        clinicalExam: formData.clinicalExam
      };

      const analysis = await analyzeWithAI(consultation);
      
      const updatedConsultation = {
        ...consultation,
        aiAnalysis: analysis
      };
      
      updateConsultation(updatedConsultation);
      
      // Set response structure for work stoppage
      setResponseStructure({
        motif: formData.motif,
        symptomes: formData.symptoms,
        examen: formData.clinicalExam,
        antecedents: formData.antecedents
      });
      
      toast.success('Analyse IA terminée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse IA');
      console.error('AI Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation</h1>
          <p className="text-gray-600">Saisissez les informations de la consultation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire principal */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Informations consultation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="motif">Motif de consultation *</Label>
              <Input
                id="motif"
                placeholder="Ex: Douleur abdominale, fièvre..."
                value={formData.motif}
                onChange={(e) => handleInputChange('motif', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="symptoms">Symptômes *</Label>
              <div className="relative">
                <Textarea
                  id="symptoms"
                  placeholder="Décrivez les symptômes détaillés..."
                  className="min-h-[120px] pr-12"
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-gray-400 hover:text-medical-primary"
                  title="Dictée vocale (à venir)"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="exam">Examen clinique</Label>
              <Textarea
                id="exam"
                placeholder="Résultats de l'examen physique..."
                className="min-h-[100px]"
                value={formData.clinicalExam}
                onChange={(e) => handleInputChange('clinicalExam', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="antecedents">Antécédents médicaux</Label>
              <Textarea
                id="antecedents"
                placeholder="Antécédents médicaux du patient..."
                className="min-h-[80px]"
                value={formData.antecedents}
                onChange={(e) => handleInputChange('antecedents', e.target.value)}
              />
            </div>
            
            {/* Bloc de Relance IA */}
            {showIaQuestion && (
              <Alert 
                id="iaQuestionField" 
                variant="default"
                className="border-amber-400 bg-amber-50"
              >
                <AlertDescription className="text-amber-800 font-medium">
                  {isLoadingRelance ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-amber-500 rounded-full border-t-transparent"></div>
                      <span>Analyse en cours...</span>
                    </div>
                  ) : iaQuestion}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Documents et actions */}
        <div className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="w-5 h-5" />
                <span>Dictée vocale</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Enregistrez votre dictée médicale pour remplir automatiquement les champs de la consultation.
              </p>
              <VoiceDictation onDictationComplete={handleDictationComplete} />
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-medical-primary transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez vos fichiers ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-gray-500">
                  Photos d'ordonnance, comptes rendus...
                </p>
                <Button variant="outline" className="mt-3">
                  Parcourir
                </Button>
              </div>
            </CardContent>
          </Card>

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
      </div>
    </div>
  );
};

export default Consultation;
