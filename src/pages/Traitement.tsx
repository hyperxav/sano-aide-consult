
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Prescription, Download, Edit, Plus } from 'lucide-react';
import { useMedical } from '@/contexts/MedicalContext';

const Traitement = () => {
  const { currentConsultation } = useMedical();
  const [medications] = useState([
    {
      name: 'Paracétamol 1000mg',
      dosage: '1 comprimé',
      frequency: '3 fois par jour',
      duration: '5 jours',
      instructions: 'À prendre au cours des repas'
    },
    {
      name: 'Ibuprofène 400mg',
      dosage: '1 comprimé',
      frequency: 'Si besoin',
      duration: '3 jours max',
      instructions: 'Maximum 3 prises par jour'
    }
  ]);

  const [recommendations] = useState([
    'Repos au lit pendant 2-3 jours',
    'Hydratation abondante (2L/jour minimum)',
    'Éviter les efforts physiques',
    'Consulter si aggravation des symptômes'
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Prescription className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traitement</h1>
          <p className="text-gray-600">Prescription et recommandations thérapeutiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ordonnance */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Prescription className="w-5 h-5" />
                <span>Ordonnance</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{med.name}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Posologie:</span> {med.dosage}</p>
                          <p><span className="font-medium">Fréquence:</span> {med.frequency}</p>
                          <p><span className="font-medium">Durée:</span> {med.duration}</p>
                          {med.instructions && (
                            <p><span className="font-medium">Instructions:</span> {med.instructions}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un médicament
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Recommandations thérapeutiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-medical-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full medical-button">
                <Download className="w-4 h-4 mr-2" />
                Exporter en PDF
              </Button>
              <Button variant="outline" className="w-full">
                Imprimer l'ordonnance
              </Button>
              <Button variant="outline" className="w-full">
                Envoyer par email
              </Button>
            </CardContent>
          </Card>

          <Card className="medical-card border-medical-warning/20">
            <CardHeader>
              <CardTitle className="text-medical-warning">Suivi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Planifier un rendez-vous de suivi dans 7 jours pour évaluer l'efficacité du traitement.
              </p>
              <Button variant="outline" className="w-full">
                Programmer suivi
              </Button>
            </CardContent>
          </Card>

          <Card className="medical-card bg-medical-light">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Traitement généré par</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 medical-gradient rounded" />
                  <span className="text-sm font-medium">SANO Express IA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Traitement;
