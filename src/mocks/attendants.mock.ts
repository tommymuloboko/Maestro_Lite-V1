import type { Attendant, AttendantTag } from '@/types/attendants';

export const mockAttendantTags: AttendantTag[] = [
  { id: 'tag-1', name: 'Senior', color: 'blue' },
  { id: 'tag-2', name: 'Trainee', color: 'yellow' },
  { id: 'tag-3', name: 'Night Shift', color: 'grape' },
];

export const mockAttendants: Attendant[] = [
  {
    id: 'att-1',
    name: 'John Mwale',
    employeeCode: 'E001',
    tag: 'Senior',
    isActive: true,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'att-2',
    name: 'Peter Banda',
    employeeCode: 'E002',
    tag: 'Senior',
    isActive: true,
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'att-3',
    name: 'Mary Zulu',
    employeeCode: 'E003',
    tag: 'Night Shift',
    isActive: true,
    createdAt: '2025-06-20T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'att-4',
    name: 'James Phiri',
    employeeCode: 'E004',
    tag: 'Trainee',
    isActive: true,
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
];
