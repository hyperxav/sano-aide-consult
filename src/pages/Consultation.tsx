
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

const Consultation = () => {
  const { currentConsultation, updateConsultation, analyzeWithAI } = useMedical();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    motif: '',
    symptoms: '',
    clinicalExam: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <span>Informations patient</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patient">Nom ou ID patient</Label>
              <Input
                id="patient"
                placeholder="Nom du patient ou identifiant"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
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
          </CardContent>
        </Card>

        {/* Documents et actions */}
        <div className="space-y-6">
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
