export type SchoolHours = {
  used: number;
  remaining: number;
  source: "Mock Google Sheets adapter";
};

export interface SchoolHoursSource {
  getHours(schoolId: string): SchoolHours | null;
}

const seededHours: Record<string, Omit<SchoolHours, "source">> = {
  "school-northstar": { used: 18, remaining: 12 },
  "school-harbor": { used: 30, remaining: 0 },
  "school-ridgeview": { used: 7, remaining: 23 },
};

export class MockGoogleSheetsHoursSource implements SchoolHoursSource {
  constructor(private readonly records = seededHours) {}

  getHours(schoolId: string): SchoolHours | null {
    const value = this.records[schoolId];
    return value ? { ...value, source: "Mock Google Sheets adapter" } : null;
  }
}

export const schoolHoursSource = new MockGoogleSheetsHoursSource();
