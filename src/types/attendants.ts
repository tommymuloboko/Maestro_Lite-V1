export interface Attendant {
  id: string;
  companyId: string;
  stationId: string;
  employeeId: string;
  attendantNo: string;
  name: string;               // display name (full_name from employee)
  employeeCode: string;
  phone?: string;
  tag?: string;               // legacy label tag
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* DB: ATTENDANT_TAGS – RFID tags assigned to attendants */
export interface AttendantRfidTag {
  id: string;
  attendantId: string;
  stationId: string;
  tagNumber: string;           // RFID tag number (unique)
  isActive: boolean;
  issuedAt: string;
  revokedAt?: string;
}

/* Legacy UI tag (label/color grouping) */
export interface AttendantTag {
  id: string;
  name: string;
  color: string;
}
