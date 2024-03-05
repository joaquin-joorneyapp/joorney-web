import * as React from 'react'
import Map from 'react-map-gl'

export default function RouteMap() {
  return (
    <Map
      mapLib={import('mapbox-gl')}
      initialViewState={{
        longitude: -73.9810846,
        latitude: 40.770708,
        zoom: 11.8,
      }}
      style={{ width: '100%', height: 780 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken="pk.eyJ1Ijoiam9hcXVpbi1qb29ybmV5IiwiYSI6ImNscmFsY2gwZzBmeDQya2xoMWcwcHgxbTcifQ.L2-sQOuxPjWYXbM3hY_QSg"
    />
  )
}
