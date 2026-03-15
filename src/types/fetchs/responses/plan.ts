import { Activity } from './activity';
import { City } from './city';

export interface Plan {
  id?: number;
  city: City;
  startDate: Date | null;
  days: number;
  schedules: DailySchedule[];
  categories: number[];
  otherOptions?: Activity[];
}

export interface DailySchedule {
  day: number;
  activities: Activity[];
  startAt: Date | null;
}
