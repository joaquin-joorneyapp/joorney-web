import { getBaseInstance } from '@/configs/axios';
import { MAPBOX_API_TOKEN, MAPBOX_MAX_ROUTE } from '@/configs/mapbox';
import { ActivityBase } from '@/types/fetchs/responses/activity';
import { chunkWithOverlap } from '@/utils/array';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

const mapboxAxios = getBaseInstance('https://api.mapbox.com/');

export const getOptimizedRoute = (
  coordinates: any[] | undefined,
  type = 'walking'
): UseQueryResult<any> =>
  useQuery({
    queryKey: [
      `optimized-trips/coordinates/${getParsedCoordinates(coordinates!)}`,
    ],
    queryFn: () => {
      return Promise.all(
        chunkWithOverlap(coordinates!, MAPBOX_MAX_ROUTE).map((chunk) =>
          mapboxAxios
            .get(
              `optimized-trips/v1/mapbox/${type}/${getParsedCoordinates(
                chunk
              )}`,
              {
                params: {
                  overview: 'simplified',
                  steps: true,
                  source: 'first',
                  destination: 'last',
                  roundtrip: false,
                  geometries: 'geojson',
                  access_token: MAPBOX_API_TOKEN,
                },
              }
            )
            .then((res) => res.data)
        )
      );
    },
    enabled: !!coordinates,
  });

function getParsedCoordinates(coordinates: ActivityBase[]) {
  return coordinates?.map((c) => `${c.longitude},${c.latitude}`).join(';');
}
