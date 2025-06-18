
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, FileText, AlertCircle } from 'lucide-react';
import { useMedical } from '@/contexts/MedicalContext';

interface NGAPCode {
  code: string;
  libelle: string;
  tarif: number;
  conditions: string;
}

const ngapCodes: NGAPCode[] = [
  { code: "C", libelle: "Consultation au cabinet", tarif: 25, conditions: "Consultation de base" },
  { code: "CS", libelle: "Consultation avec majoration", tarif: 46, conditions: "Consultation complexe ou urgente" },
  { code: "V", libelle: "Visite à domicile", tarif: 25, conditions: "Déplacement au domicile" },
  { code: "VS", libelle: "Visite à domicile avec majoration", tarif: 46, conditions: "Visite urgente ou complexe" },
  { code: "K", libelle: "Acte technique (coefficient 1)", tarif: 2.28, conditions: "Geste technique simple" },
  { code: "KC", libelle: "Acte technique (coefficient 2)", tarif: 4.56, conditions: "Geste technique complexe" },
  { code: "AMI", libelle: "Acte médical d'imagerie", tarif: 19.06, conditions: "Échographie, radiologie" },
  { code: "MD", libelle: "Majoration de déplacement", tarif: 5, conditions: "Supplément déplacement" }
];

const ActeConsultation = () => {
  const { currentConsultation } = useMedical();
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [selectedGestes, setSelectedGestes] = useState<string[]>([]);
  const [totalTarif, setTotalTarif] = useState<number>(0);

  const handleCodeSelection = (code: string) => {
    setSelectedCode(code);
    const selectedNGAP = ngapCodes.find(c => c.code === code);
    if (selectedNGAP) {
      setTotalTarif(selectedNGAP.tarif);
    }
  };

  const addGeste = (geste: string) => {
    if (!selectedGestes.includes(geste)) {
      setSelectedGestes([...selectedGestes, geste]);
      const gesteCode = ngapCodes.find(c => c.code === geste);
      if (gesteCode) {
        setTotalTarif(prev => prev + gesteCode.tarif);
      }
    }
  };

  const removeGeste = (geste: string) => {
    setSelectedGestes(selectedGestes.filter(g => g !== geste));
    const gesteCode = ngapCodes.find(c => c.code === geste);
    if (gesteCode) {
      setTotalTarif(prev => prev - gesteCode.tarif);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Calculator className="w-8 h-8 text-medical-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Acte de consultation</h1>
          <p className="text-gray-600">Cotation NGAP et tarification</p>
        </div>
      </div>

      {/* Sélection du code principal */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Code NGAP principal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de consultation
            </label>
            <Select onValueChange={handleCodeSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le code NGAP principal" />
              </SelectTrigger>
              <SelectContent>
                {ngapCodes.slice(0, 4).map((code) => (
                  <SelectItem key={code.code} value={code.code}>
                    <div className="flex justify-between items-center w-full">
                      <span>{code.code} - {code.libelle}</span>
                      <span className="ml-4 text-medical-primary font-medium">{code.tarif}€</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCode && (
            <div className="p-4 bg-medical-primary/5 rounded-lg border border-medical-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-medical-primary">
                    Code sélectionné : {selectedCode}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {ngapCodes.find(c => c.code === selectedCode)?.conditions}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-medical-primary text-white">
                  {ngapCodes.find(c => c.code === selectedCode)?.tarif}€
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestes techniques complémentaires */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Gestes techniques complémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ngapCodes.slice(4).map((geste) => (
              <div
                key={geste.code}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedGestes.includes(geste.code)
                    ? 'border-medical-primary bg-medical-primary/5'
                    : 'border-gray-200 hover:border-medical-primary/50'
                }`}
                onClick={() => 
                  selectedGestes.includes(geste.code) 
                    ? removeGeste(geste.code)
                    : addGeste(geste.code)
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-900">{geste.code}</h5>
                    <p className="text-sm text-gray-600">{geste.libelle}</p>
                  </div>
                  <span className="text-medical-primary font-medium">+{geste.tarif}€</span>
                </div>
              </div>
            ))}
          </div>

          {selectedGestes.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">Gestes sélectionnés :</h5>
              <div className="flex flex-wrap gap-2">
                {selectedGestes.map((geste) => (
                  <Badge 
                    key={geste} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeGeste(geste)}
                  >
                    {geste} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Récapitulatif et total */}
      <Card className="medical-card border-medical-primary/20">
        <CardHeader>
          <CardTitle className="text-medical-primary">Récapitulatif de la cotation</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCode ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Code principal : {selectedCode}</span>
                <span className="font-medium">{ngapCodes.find(c => c.code === selectedCode)?.tarif}€</span>
              </div>
              
              {selectedGestes.map((geste) => {
                const gesteData = ngapCodes.find(c => c.code === geste);
                return (
                  <div key={geste} className="flex justify-between items-center py-2 border-b">
                    <span>Geste : {geste} - {gesteData?.libelle}</span>
                    <span className="font-medium">{gesteData?.tarif}€</span>
                  </div>
                );
              })}
              
              <div className="flex justify-between items-center py-3 bg-medical-primary/10 px-4 rounded-lg">
                <span className="text-lg font-semibold text-medical-primary">Total :</span>
                <span className="text-xl font-bold text-medical-primary">{totalTarif.toFixed(2)}€</span>
              </div>

              <Button className="w-full medical-button mt-4">
                Valider la cotation
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Sélectionnez un code NGAP principal pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActeConsultation;
