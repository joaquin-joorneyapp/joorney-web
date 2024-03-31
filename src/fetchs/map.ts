import { getBaseInstance } from '@/configs/axios';
import { MAPBOX_API_TOKEN } from '@/configs/mapbox';
import { ActivityBase } from '@/types/fetchs/responses/activity';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

const mapboxAxios = getBaseInstance('https://api.mapbox.com/');

export const getOptimizedRoute = (
  coordinates: any[] | undefined,
  type = 'walking'
): UseQueryResult<any> =>
  useQuery({
    queryKey: [
      `optimized-trips/coordinates/${getParsedCoordinates(coordinates)}`,
    ],
    queryFn: () =>
      mapboxAxios
        .get(
          `optimized-trips/v1/mapbox/${type}/${getParsedCoordinates(
            coordinates
          )}`,
          {
            params: {
              overview: 'full',
              steps: true,
              geometries: 'geojson',
              source: 'first',
              access_token: MAPBOX_API_TOKEN,
            },
          }
        )
        .then((res) => res.data),
    enabled: !!coordinates,
  });

function getParsedCoordinates(coordinates: ActivityBase[]) {
  return coordinates?.map((c) => `${c.longitude},${c.latitude}`).join(';');
}
