import { MAPBOX_API_TOKEN } from '@/configs/mapbox';
import { Activity } from '@/types/fetchs/responses/activity';
import { City } from '@/types/fetchs/responses/city';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  bbox,
  feature,
  FeatureCollection,
  featureCollection
} from '@turf/turf';
import { useEffect, useRef, useState } from 'react';
import Map, { Layer, MapRef, Marker, Source } from 'react-map-gl';
import DisplayActivity from '../plan/DisplayActivity';

export default function RouteMap({
  activities,
  routes,
  city,
  focusActivity,
}: {
  activities: Activity[];
  routes: any;
  city: City;
  focusActivity: number | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const mapRef = useRef<MapRef>(null);
  const [data, setData] = useState<FeatureCollection>(featureCollection([]));
  const [selected, setSelected] = useState<number | null>(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (routes && mapRef.current) {
      const validRoutes = routes.filter(
        (route: any) => route?.trips?.[0]?.geometry
      );

      if (validRoutes.length === 0) {
        if (activities.length === 1) {
          mapRef.current.flyTo({
            center: [activities[0].longitude, activities[0].latitude],
            zoom: 14,
            duration: 300,
          });
        }
        return;
      }

      const points = featureCollection(
        validRoutes.map((route: any) => feature(route.trips[0].geometry))
      );
      setData(points);

      const bounds = bbox(points);

      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 100, duration: 300 }
      );
    } else {
      setData(featureCollection([]));
    }
  }, [activities, mapRef.current]);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
      {!mapLoaded && (
        <Skeleton
          variant="rectangular"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            height: '100%',
          }}
        />
      )}
      <Map
        ref={mapRef}
        mapLib={import('mapbox-gl')}
        initialViewState={{
          zoom: 11.8,
        }}
        style={{ width: '100%', height: 600 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={`${MAPBOX_API_TOKEN}`}
        onLoad={() => setMapLoaded(true)}
      >
        <Source id="route" type="geojson" data={data} />
        <Layer
          type="line"
          source="route"
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
          paint={{
            'line-color': '#3887be',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 22, 12],
          }}
          beforeId="waterway-label"
        />
        <Layer
          id="routearrows"
          type="symbol"
          source="route"
          layout={{
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': ['interpolate', ['linear'], ['zoom'], 12, 24, 22, 60],
            'symbol-spacing': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12,
              30,
              22,
              160,
            ],
            'text-keep-upright': false,
          }}
          paint={{
            'text-color': '#3887be',
            'text-halo-color': 'hsl(55, 11%, 96%)',
            'text-halo-width': 3,
          }}
          beforeId="waterway-label"
        />
        {activities.map((a, i) => (
          <Marker
            key={i}
            longitude={a.longitude}
            latitude={a.latitude}
            onClick={() => (setSelectedActivity(a), setViewDetails(true))}
            style={{ cursor: 'pointer' }}
          >
            <div
              onMouseEnter={() => setSelected(a.id)}
              onMouseLeave={() => setSelected(null)}
            >
              <Chip
                label={selected === a.id ? a.title : i + 1}
                variant="filled"
                color={
                  focusActivity === a.id || selected === a.id
                    ? 'primary'
                    : 'secondary'
                }
                sx={{ color: 'white', fontWeight: 'bold' }}
                size="medium"
              />
            </div>
          </Marker>
        ))}
      </Map>
      </Box>
      <Dialog
        scroll={isMobile ? 'paper' : 'body'}
        fullWidth={!isMobile}
        fullScreen={isMobile}
        maxWidth={'xl'}
        open={viewDetails}
        onClose={() => setViewDetails(false)}
      >
        <DialogContent
          dividers
          sx={{ pt: { xs: 1.5, md: 3 }, px: { xs: 1.5, md: 6 } }}
        >
          {selectedActivity && (
            <DisplayActivity
              activityName={selectedActivity?.name}
              cityName={city.name}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
