import { Picture } from './activity';

export interface City {
  id: number;
  name: string;
  title: string;
  country: string;
  latitude: number;
  longitude: number;
  pictures: Picture[];
}
