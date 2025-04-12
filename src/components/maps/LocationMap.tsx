import { Map, Marker } from 'react-map-gl';

const LocationMap = ({ latitude, longitude }: {latitude: number, longitude: number}) => {
  return (
    <Map
      mapboxAccessToken="pk.eyJ1Ijoiam9hcXVpbi1qb29ybmV5IiwiYSI6ImNscmFsY2gwZzBmeDQya2xoMWcwcHgxbTcifQ.L2-sQOuxPjWYXbM3hY_QSg"
      initialViewState={{
        longitude,
        latitude,
        zoom: 14,
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Marker longitude={longitude} latitude={latitude} color="orange" />
    </Map>
  );
};

export default LocationMap;
