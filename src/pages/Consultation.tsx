
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Mic, Brain, FileDown } from 'lucide-react';
import { useMedical } from '@/contexts/MedicalContext';
import { Consultation as ConsultationType } from '@/types/medical';
import { toast } from 'sonner';
import VoiceDictation from '@/components/VoiceDictation';

interface DictationResult {
  motif: string;
  symptomes: string;
  examen: string;
  antecedents: string;
}

const Consultation = () => {
  const { currentConsultation, updateConsultation, analyzeWithAI } = useMedical();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingArret, setIsGeneratingArret] = useState(false);
  const [responseStructure, setResponseStructure] = useState<DictationResult | null>(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientNom: '',
    patientPrenom: '',
    patientNaissance: '',
    motif: '',
    symptoms: '',
    clinicalExam: '',
    antecedents: '',
    dateDebut: '',
    dateFin: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDictationComplete = (result: DictationResult) => {
    setFormData(prev => ({
      ...prev,
      motif: result.motif,
      symptoms: result.symptomes,
      clinicalExam: result.examen,
      antecedents: result.antecedents
    }));
    setResponseStructure(result);
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

  const handleGenerateArret = async () => {
    if (!formData.patientNom || !formData.patientPrenom || !formData.dateDebut || !formData.dateFin) {
      toast.error('Veuillez remplir tous les champs patient et dates');
      return;
    }

    if (!responseStructure?.motif) {
      toast.error('Veuillez d\'abord structurer les données de consultation');
      return;
    }

    setIsGeneratingArret(true);
    try {
      const requestBody = {
        patient: {
          nom: formData.patientNom,
          prenom: formData.patientPrenom,
          dateNaissance: formData.patientNaissance
        },
        motif: responseStructure.motif,
        dates: {
          debut: formData.dateDebut,
          fin: formData.dateFin
        }
      };

      const response = await fetch('https://sano-api-production.up.railway.app/api/arret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Check if response is PDF
      const contentType = response.headers.get('Content-Type');
      if (!contentType?.includes('application/pdf')) {
        throw new Error('La réponse n\'est pas un fichier PDF');
      }

      // Get PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Arret_${formData.patientNom}_${formData.dateDebut}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Arrêt de travail généré');
    } catch (error) {
      console.error('Erreur lors de la génération de l\'arrêt:', error);
      toast.error('Erreur lors de la génération de l\'arrêt de travail');
    } finally {
      setIsGeneratingArret(false);
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
              <span>Informations patient</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientNom">Nom *</Label>
                <Input
                  id="patientNom"
                  placeholder="Nom du patient"
                  value={formData.patientNom}
                  onChange={(e) => handleInputChange('patientNom', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patientPrenom">Prénom *</Label>
                <Input
                  id="patientPrenom"
                  placeholder="Prénom du patient"
                  value={formData.patientPrenom}
                  onChange={(e) => handleInputChange('patientPrenom', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="patientNaissance">Date de naissance</Label>
              <Input
                id="patientNaissance"
                type="date"
                value={formData.patientNaissance}
                onChange={(e) => handleInputChange('patientNaissance', e.target.value)}
              />
            </div>

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

            {/* Dates d'arrêt de travail */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Arrêt de travail</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateDebut">Date de début *</Label>
                  <Input
                    id="dateDebut"
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateFin">Date de fin *</Label>
                  <Input
                    id="dateFin"
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => handleInputChange('dateFin', e.target.value)}
                  />
                </div>
              </div>
            </div>
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

          <Card className="medical-card border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <FileDown className="w-5 h-5" />
                <span>Arrêt de travail</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Générez automatiquement un arrêt de travail au format PDF.
              </p>
              <Button 
                onClick={handleGenerateArret}
                disabled={isGeneratingArret}
                variant="secondary"
                className="w-full"
              >
                {isGeneratingArret ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    📝 Arrêt de travail
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
