
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Send, Copy, Download } from 'lucide-react';

const Courrier = () => {
  const [letterData, setLetterData] = useState({
    specialist: '',
    service: '',
    hospital: '',
    content: `Cher confrère,

Je vous adresse Monsieur/Madame [Nom du patient], âgé(e) de [âge] ans, que je suis pour [motif de consultation].

ANTÉCÉDENTS:
[Antécédents médicaux pertinents]

HISTOIRE DE LA MALADIE:
[Description détaillée des symptômes et évolution]

EXAMEN CLINIQUE:
[Résultats de l'examen physique]

EXAMENS COMPLÉMENTAIRES:
[Résultats des examens réalisés]

TRAITEMENT ACTUEL:
[Médicaments et posologies en cours]

Je vous serais reconnaissant(e) de bien vouloir donner votre avis sur cette situation et prendre en charge ce patient selon vos recommandations.

Je reste à votre disposition pour tout complément d'information.

Confraternellement,

Dr [Votre nom]
[Spécialité]
[Cabinet/Hôpital]
[Téléphone/Email]`
  });

  const handleInputChange = (field: string, value: string) => {
    setLetterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courrier au spécialiste</h1>
          <p className="text-gray-600">Génération automatique du courrier de liaison</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Informations du destinataire */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Destinataire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="specialist">Spécialiste</Label>
              <Input
                id="specialist"
                placeholder="Dr. Martin"
                value={letterData.specialist}
                onChange={(e) => handleInputChange('specialist', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                placeholder="Cardiologie"
                value={letterData.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hospital">Établissement</Label>
              <Input
                id="hospital"
                placeholder="CHU de..."
                value={letterData.hospital}
                onChange={(e) => handleInputChange('hospital', e.target.value)}
              />
            </div>
            <Button className="w-full medical-button">
              <Send className="w-4 h-4 mr-2" />
              Générer avec IA
            </Button>
          </CardContent>
        </Card>

        {/* Contenu du courrier */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="medical-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contenu du courrier</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={letterData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Le contenu du courrier sera généré automatiquement..."
              />
            </CardContent>
          </Card>

          {/* Aperçu */}
          <Card className="medical-card bg-gray-50">
            <CardHeader>
              <CardTitle>Aperçu du courrier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="space-y-4">
                  <div className="text-right text-sm text-gray-600">
                    {new Date().toLocaleDateString('fr-FR')}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {letterData.specialist || 'Dr. [Nom du spécialiste]'}
                    </p>
                    <p>{letterData.service || '[Service]'}</p>
                    <p>{letterData.hospital || '[Établissement]'}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="whitespace-pre-line text-sm text-gray-700">
                      {letterData.content.substring(0, 300)}
                      {letterData.content.length > 300 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Courrier;
