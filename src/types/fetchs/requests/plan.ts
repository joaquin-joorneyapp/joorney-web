export interface GetInitialPlanForm {
    days: number;
    cityName?: string;
    selectedCategories: number[]
}

export interface SavePlanForm extends GetInitialPlanForm{
    schedules: number[][]
}