export type Profile = {
  id: string;
  full_name: string;
  role: 'secretaria' | 'medico';
};

export type Specialty = {
  id: number;
  name: string;
};

export type Patient = {
  id: number;
  full_name: string;
  rg: string | null;
  phone: string | null;
  notes: string | null;
};

export type Appointment = {
  id: number;
  patient_id: number;
  specialty_id: number;
  doctor_id: string;
  appointment_date: string; // DATE representation
  appointment_time: string;
  turn: 'MANHÃ' | 'TARDE' | 'NOITE';
  status: 'agendado' | 'atendido' | 'faltou' | 'cancelado';
  medical_notes: string | null;
};

// Joined types for the frontend views
export type AppointmentWithDetails = Appointment & {
  patients: Patient;
  specialties: Specialty;
  profiles: Profile; // The doctor's profile
};
