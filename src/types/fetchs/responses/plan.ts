import { Activity } from "./activity"
import { City } from "./city"

export interface Plan {
    city: City
    start: Date | null
    days: number
    schedules: DailySchedule[]
    categories: number[]
}

export interface DailySchedule {
    day: number
    activities: Activity[]
    startAt: Date | null
}