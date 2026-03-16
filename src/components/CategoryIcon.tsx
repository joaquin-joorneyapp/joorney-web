import {
  AccountBalance,
  Attractions,
  Category,
  Church,
  Commute,
  Fastfood,
  Landscape,
  LibraryBooks,
  LocalBar,
  LocalCafe,
  Museum,
  NaturePeople,
  Palette,
  Pets,
  Restaurant,
  Route,
  SingleBed,
  Stadium,
  Store,
  Synagogue,
  TheaterComedy,
  Train,
  Water,
} from '@mui/icons-material';

const ICONS = {
  park: NaturePeople,
  museum: Museum,
  art_gallery: Palette,
  lodging: SingleBed,
  train_station: Train,
  transit_station: Commute,
  natural_feature: Landscape,
  route: Route,
  zoo: Pets,
  church: Church,
  place_of_worship: Synagogue,
  stadium: Stadium,
  library: LibraryBooks,
  store: Store,
  restaurant: Restaurant,
  food: Fastfood,
  movie_theater: TheaterComedy,
  amusement_park: Attractions,
  cemetery: null,
  cafe: LocalCafe,
  finance: AccountBalance,
  aquarium: Water,
  department_store: Store,
  shoe_store: Store,
  furniture_store: Store,
  clothing_store: Store,
  home_goods_store: Store,
  jewelry_store: Store,
  bar: LocalBar,
} as any;

const DEFAULT_ICON = Category;

export default function CategoryIcon({
  category,
  ...props
}: {
  category: string;
  color?: string;
  sx?: object;
}) {
  const CategoryIcon = ICONS[category] || DEFAULT_ICON;
  return <CategoryIcon {...props}></CategoryIcon>;
}
