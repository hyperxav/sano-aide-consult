
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Heart, AlertTriangle, Calendar, Download, Edit } from 'lucide-react';

const ETP = () => {
  const [etpData] = useState({
    diagnosis: 'Hypertension artérielle',
    simplifiedExplanation: 'Votre tension artérielle est plus élevée que la normale. Cela signifie que votre cœur doit travailler plus fort pour pomper le sang dans vos artères.',
    lifestyle: [
      'Réduire la consommation de sel (moins de 6g par jour)',
      'Pratiquer une activité physique régulière (30 min, 5 fois par semaine)',
      'Maintenir un poids santé',
      'Limiter la consommation d\'alcool',
      'Arrêter le tabac si applicable',
      'Gérer le stress par des techniques de relaxation'
    ],
    warningSigns: [
      'Maux de tête intenses et persistants',
      'Troubles de la vision',
      'Douleurs thoraciques',
      'Essoufflement important',
      'Vertiges ou malaises'
    ],
    followUp: 'Rendez-vous de contrôle dans 1 mois pour vérifier l\'efficacité du traitement et ajuster si nécessaire.'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <User className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fiche ETP</h1>
          <p className="text-gray-600">Éducation thérapeutique du patient</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnostic simplifié */}
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-medical-primary" />
                <span>Votre diagnostic</span>
              </CardTitle>
              <Badge className="bg-medical-primary">Pour le patient</Badge>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {etpData.diagnosis}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {etpData.simplifiedExplanation}
              </p>
            </CardContent>
          </Card>

          {/* Conseils d'hygiène de vie */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-medical-success" />
                <span>Conseils pour votre santé</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {etpData.lifestyle.map((advice, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-medical-success/5 rounded-lg">
                    <div className="w-2 h-2 bg-medical-success rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{advice}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signes d'alerte */}
          <Card className="medical-card border-medical-danger/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-medical-danger">
                <AlertTriangle className="w-5 h-5" />
                <span>Quand consulter en urgence ?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Consultez immédiatement ou appelez le 15 si vous ressentez un ou plusieurs de ces symptômes :
              </p>
              <div className="space-y-3">
                {etpData.warningSignes.map((sign, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-medical-danger/5 rounded-lg border border-medical-danger/20">
                    <AlertTriangle className="w-4 h-4 text-medical-danger mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 font-medium">{sign}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suivi */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-medical-warning" />
                <span>Votre suivi médical</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-medical-warning/5 rounded-lg border border-medical-warning/20">
                <p className="text-gray-700">{etpData.followUp}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions et informations */}
        <div className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full medical-button">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Personnaliser
              </Button>
              <Button variant="outline" className="w-full">
                Imprimer
              </Button>
              <Button variant="outline" className="w-full">
                Envoyer par email
              </Button>
            </CardContent>
          </Card>

          <Card className="medical-card bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">Ressources utiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium text-blue-700">Sites web recommandés :</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• Ameli.fr</li>
                  <li>• Haute Autorité de Santé</li>
                  <li>• Fédération Française de Cardiologie</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Fiche générée par</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 medical-gradient rounded" />
                  <span className="text-sm font-medium">SANO Express</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Assistant IA pour médecins
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ETP;
