
export interface Patient {
  id: string;
  name: string;
  dateOfBirth?: string;
  consultations: Consultation[];
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  motif: string;
  symptoms: string;
  clinicalExam: string;
  documents?: File[];
  aiAnalysis?: AIAnalysis;
  selectedDiagnosis?: string;
  treatment?: Treatment;
  referralLetter?: string;
  educationalSheet?: string;
}

export interface AIAnalysis {
  clinicalSynthesis: string;
  differentialDiagnosis: string[];
  recommendedTreatment: string;
  confidence: number;
}

export interface Treatment {
  medications: Medication[];
  recommendations: string[];
  followUp: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
