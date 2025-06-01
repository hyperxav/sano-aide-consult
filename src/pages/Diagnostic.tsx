
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useMedical } from '@/contexts/MedicalContext';

const Diagnostic = () => {
  const { currentConsultation } = useMedical();
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);

  const aiAnalysis = currentConsultation?.aiAnalysis;

  if (!aiAnalysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Search className="w-8 h-8 text-medical-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Diagnostic</h1>
            <p className="text-gray-600">Hypothèses diagnostiques et recommandations</p>
          </div>
        </div>

        <Card className="medical-card text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Aucune analyse disponible
            </h3>
            <p className="text-gray-500 mb-6">
              Veuillez d'abord effectuer une consultation et lancer l'analyse IA.
            </p>
            <Button variant="outline">
              Retour à la consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Search className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic</h1>
          <p className="text-gray-600">Hypothèses diagnostiques et recommandations</p>
        </div>
      </div>

      {/* Synthèse clinique */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-medical-success" />
            <span>Synthèse clinique (SOAP)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {aiAnalysis.clinicalSynthesis}
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <Badge variant="secondary" className="bg-medical-success/10 text-medical-success">
              Confiance IA: {Math.round(aiAnalysis.confidence * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic différentiel */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Diagnostic différentiel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiAnalysis.differentialDiagnosis.map((diagnosis, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedDiagnosis === diagnosis
                    ? 'border-medical-primary bg-medical-primary/5'
                    : 'border-gray-200 hover:border-medical-primary/50'
                }`}
                onClick={() => setSelectedDiagnosis(diagnosis)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 
                        ? 'bg-medical-primary' 
                        : index === 1 
                        ? 'bg-medical-warning' 
                        : 'bg-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">{diagnosis}</span>
                  </div>
                  {selectedDiagnosis === diagnosis && (
                    <CheckCircle className="w-5 h-5 text-medical-primary" />
                  )}
                </div>
                {index === 0 && (
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    Diagnostic principal probable
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {selectedDiagnosis && (
            <div className="mt-6 p-4 bg-medical-primary/5 rounded-lg border border-medical-primary/20">
              <h4 className="font-semibold text-medical-primary mb-2">
                Diagnostic sélectionné
              </h4>
              <p className="text-sm text-gray-700">{selectedDiagnosis}</p>
              <Button className="mt-3 medical-button">
                Continuer vers le traitement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Diagnostic;
