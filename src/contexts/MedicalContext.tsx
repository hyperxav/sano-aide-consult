
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient, Consultation, AIAnalysis } from '@/types/medical';
import { supabase } from '@/lib/supabase';

interface MedicalContextType {
  currentPatient: Patient | null;
  currentConsultation: Consultation | null;
  patients: Patient[];
  setCurrentPatient: (patient: Patient | null) => void;
  setCurrentConsultation: (consultation: Consultation | null) => void;
  addPatient: (patient: Patient) => void;
  updateConsultation: (consultation: Consultation) => void;
  analyzeWithAI: (consultation: Consultation) => Promise<AIAnalysis>;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

export const useMedical = () => {
  const context = useContext(MedicalContext);
  if (!context) {
    throw new Error('useMedical must be used within a MedicalProvider');
  }
  return context;
};

export const MedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [currentConsultation, setCurrentConsultation] = useState<Consultation | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  const addPatient = useCallback((patient: Patient) => {
    setPatients(prev => [...prev, patient]);
  }, []);

  const updateConsultation = useCallback((consultation: Consultation) => {
    setCurrentConsultation(consultation);
    setPatients(prev => prev.map(patient => 
      patient.id === consultation.patientId 
        ? {
            ...patient,
            consultations: patient.consultations.map(c => 
              c.id === consultation.id ? consultation : c
            )
          }
        : patient
    ));
  }, []);

  const analyzeWithAI = useCallback(async (consultation: Consultation): Promise<AIAnalysis> => {
    try {
      console.log('Analyzing consultation with AI:', consultation);
      
      const { data, error } = await supabase.functions.invoke('analyze-consultation', {
        body: { consultation }
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (!data?.analysis) {
        throw new Error('Invalid response from AI analysis');
      }

      return data.analysis;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback response en cas d'erreur
      return {
        clinicalSynthesis: `Synthèse clinique pour ${consultation.motif}: ${consultation.symptoms}`,
        differentialDiagnosis: [
          'Diagnostic principal probable',
          'Diagnostic différentiel 1', 
          'Diagnostic différentiel 2'
        ],
        recommendedTreatment: 'Traitement symptomatique recommandé. Consultation de suivi nécessaire.',
        confidence: 0.7
      };
    }
  }, []);

  return (
    <MedicalContext.Provider
      value={{
        currentPatient,
        currentConsultation,
        patients,
        setCurrentPatient,
        setCurrentConsultation,
        addPatient,
        updateConsultation,
        analyzeWithAI
      }}
    >
      {children}
    </MedicalContext.Provider>
  );
};
