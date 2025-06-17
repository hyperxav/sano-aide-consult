
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileDown, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const ArretTravail = () => {
  const [isGeneratingArret, setIsGeneratingArret] = useState(false);
  const [formData, setFormData] = useState({
    patientNom: '',
    patientPrenom: '',
    patientNaissance: '',
    dateDebut: '',
    dateFin: '',
    motif: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateArret = async () => {
    if (!formData.patientNom || !formData.patientPrenom || !formData.dateDebut || !formData.dateFin) {
      toast.error('Veuillez remplir tous les champs requis');
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
        motif: formData.motif,
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
        <FileDown className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arrêt de travail</h1>
          <p className="text-gray-600">Génération d'arrêts de travail au format PDF</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations patient */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
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
              <Label htmlFor="motif">Motif médical</Label>
              <Input
                id="motif"
                placeholder="Raison de l'arrêt de travail"
                value={formData.motif}
                onChange={(e) => handleInputChange('motif', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dates et génération */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Période d'arrêt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="pt-6">
              <Button 
                onClick={handleGenerateArret}
                disabled={isGeneratingArret}
                className="w-full medical-button"
                size="lg"
              >
                {isGeneratingArret ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5 mr-2" />
                    📝 Générer l'arrêt de travail
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="medical-card bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions :</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Remplissez tous les champs obligatoires marqués d'un astérisque (*)</li>
            <li>• Le motif médical justifiera l'arrêt de travail</li>
            <li>• Le PDF sera automatiquement téléchargé une fois généré</li>
            <li>• Vérifiez les dates avant de valider</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArretTravail;
