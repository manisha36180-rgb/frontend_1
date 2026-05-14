import { User, Vessel, Report, DashboardStats } from "@/types";

export const mockUsers: User[] = [
  { id: '1', name: 'Shanthi', email: 'admin@inspection.com', role: 'ADMIN' },
  { id: '2', name: 'Sam', email: 'user@inspection.com', role: 'USER' },
  { id: '3', name: 'Robert', email: 'supt@inspection.com', role: 'SUPERINTENDENT' },
];

export const mockVessels: Vessel[] = [
  { id: 'v1', name: 'Sea Voyager', imoNumber: '9876543', type: 'Oil Tanker', flag: 'Panama', builtYear: 2018, status: 'ACTIVE' },
  { id: 'v2', name: 'Ocean Grace', imoNumber: '1234567', type: 'Container Ship', flag: 'Liberia', builtYear: 2015, status: 'ACTIVE' },
  { id: 'v3', name: 'Arctic Star', imoNumber: '5566778', type: 'Bulk Carrier', flag: 'Norway', builtYear: 2020, status: 'ACTIVE' },
  { id: 'v4', name: 'Solaris', imoNumber: '8899001', type: 'LNG Carrier', flag: 'Singapore', builtYear: 2022, status: 'INACTIVE' },
];

export const mockReports: Report[] = [
  {
    id: 'r1',
    vesselId: 'v1',
    vesselName: 'Sea Voyager',
    inspectorName: 'Sam',
    date: '2024-03-15',
    status: 'APPROVED',
    location: 'Singapore Port',
    summary: 'Annual safety inspection completed. Vessel in good condition.',
    findings: [
      { id: 'f1', category: 'Safety', description: 'Lifeboat drill successful', severity: 'LOW', status: 'CLOSED' }
    ],
    attachments: ['report1.pdf']
  },
  {
    id: 'r2',
    vesselId: 'v2',
    vesselName: 'Ocean Grace',
    inspectorName: 'Robert',
    date: '2024-03-20',
    status: 'PENDING',
    location: 'Rotterdam',
    summary: 'Deck inspection revealed minor corrosion issues.',
    findings: [
      { id: 'f2', category: 'Maintenance', description: 'Surface rust on deck area B', severity: 'MEDIUM', status: 'OPEN' }
    ],
    attachments: ['deck_photo.jpg']
  },
  {
    id: 'r3',
    vesselId: 'v3',
    vesselName: 'Arctic Star',
    inspectorName: 'Sam',
    date: '2024-04-05',
    status: 'REJECTED',
    location: 'Dubai',
    summary: 'Incomplete documentation for engine maintenance.',
    findings: [
      { id: 'f3', category: 'Documentation', description: 'Missing logbook entries for April', severity: 'HIGH', status: 'OPEN' }
    ],
    attachments: []
  }
];

export const mockStats: DashboardStats = {
  totalVessels: 4,
  totalReports: 3,
  pendingApprovals: 1,
  approvedReports: 1,
};
