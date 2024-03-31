import { Category } from './category';
import { City } from './city';

export interface Activity extends ActivityBase {
  categories: Category[];
}

export interface ActivityBase {
  id: number;
  name: string;
  title: string;
  description: string;
  address: string;
  duration: number;
  latitude: number;
  longitude: number;
  city: City;
  cityId: number;
  pictures: Picture[];
}

export interface ActivityEditForm extends ActivityBase {
  categories: number[] | Set<number>;
}

export interface Picture {
  url: string;
}
