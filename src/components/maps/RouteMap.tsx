import { MAPBOX_API_TOKEN } from '@/configs/mapbox';
import { Activity } from '@/types/fetchs/responses/activity';
import { City } from '@/types/fetchs/responses/city';
import { Box, Button, Chip, Dialog, DialogActions } from '@mui/material';
import { bbox, feature, featureCollection } from '@turf/turf';
import { useEffect, useRef, useState } from 'react';
import Map, { Layer, MapRef, Marker, Source } from 'react-map-gl';
import DisplayActivity from '../plan/DisplayActivity';

export default function RouteMap({
  activities,
  route,
  city,
  focusActivity,
}: {
  activities: Activity[];
  route: any;
  city: City;
  focusActivity: number | null;
}) {
  const mapRef = useRef<MapRef>();
  const [data, setData] = useState(featureCollection([]));
  const [selected, setSelected] = useState<number | null>(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  useEffect(() => {
    if (route && mapRef.current) {
      const points = featureCollection([feature(route.trips[0].geometry)]);
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
      <Map
        ref={mapRef}
        mapLib={import('mapbox-gl')}
        initialViewState={{
          zoom: 11.8,
        }}
        style={{ width: '100%', height: 780 }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxAccessToken={`${MAPBOX_API_TOKEN}`}
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
      <Dialog
        scroll={'body'}
        fullWidth={true}
        maxWidth={'xl'}
        open={viewDetails}
        onClose={() => setViewDetails(false)}
      >
        <Box sx={{ pt: 3, pl: 6, pr: 6 }}>
          {selectedActivity && (
            <DisplayActivity
              activityName={selectedActivity?.name}
              cityName={city.name}
            />
          )}
        </Box>
        <DialogActions>
          <Button onClick={() => setViewDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
