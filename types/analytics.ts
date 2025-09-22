export interface VisitData {
  id?: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitDate: string;
  visitTime: string;
  visitType: 'consultation' | 'therapy' | 'assessment' | 'follow-up' | 'emergency';
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  therapistAssigned?: string;
  duration: number;
  createdAt?: string;
  updatedAt?: string;
}
