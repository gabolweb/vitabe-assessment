export interface Service {
  id: number;
  name: string;
  duration_min: number;
}

export interface Appointment {
  id: number;
  client_name: string;
  data_hora: string;
  starts_at: string;
  ends_at: string;
  duration_snapshot: number;
  service: Service;
}

export interface CreateAppointmentPayload {
  client_name: string;
  service_id: number;
  starts_at: string;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}
