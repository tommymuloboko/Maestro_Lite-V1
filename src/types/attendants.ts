export interface Attendant {
  id: string;
  name: string;
  employeeCode: string;
  tag?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendantTag {
  id: string;
  name: string;
  color: string;
}
