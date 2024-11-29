'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript, DrawingManager, Marker } from '@react-google-maps/api';

interface MapProps {
  id: number;
}

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 37.7749,
  lng: -122.4194, // Example coordinates (San Francisco)
};

const GoogleMapComponentDivide: React.FC<MapProps> = ({ id }) => {
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]); // Store polygons
  const [isPolygonMode, setIsPolygonMode] = useState(false); // Toggle drawing mode
  const mapRef = useRef<google.maps.Map | null>(null); // Reference to map
  const [token, setToken] = useState<string>(''); // Token state

  // Fetch token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch saved polygons from the server on load
  useEffect(() => {
    if (!token) return; // If no token, don't fetch

    const fetchSavedPolygons = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/land/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved polygons');
        }

        const landData = await response.json();

        // Assuming polygons are stored in landData.polygons as an array of coordinates
        const savedPolygons = landData.polygons.map((polygon: { lat: number; lng: number }[]) => {
          const path = polygon.map(({ lat, lng }) => new google.maps.LatLng(lat, lng));

          // Create a polygon and set it on the map
          const googlePolygon = new google.maps.Polygon({
            paths: path,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
          });

          // Add polygon to map immediately after creation
          googlePolygon.setMap(mapRef.current);

          return googlePolygon;
        });

        setPolygons(savedPolygons); // Store polygons in state
      } catch (error) {
        console.error('Error fetching saved polygons:', error);
      }
    };

    fetchSavedPolygons();
  }, [token, id]); // Add token and id as dependencies

  // Handle saving polygons
  const savePolygons = async () => {
    if (!token) return; // If no token, don't save

    const savedPolygons = polygons.map((polygon) =>
      polygon.getPath().getArray().map((latLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }))
    );

    try {
      const response = await fetch(`http://localhost:3000/api/land/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ polygons: savedPolygons }),
      });

      if (!response.ok) {
        throw new Error('Failed to save polygons');
      }

      const result = await response.json();
      console.log('Polygons saved successfully:', result);
    } catch (error) {
      console.error('Error saving polygons:', error);
    }
  };

  // Initialize map and DrawingManager
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    // Once the map is loaded, add the polygons
    polygons.forEach((polygon) => {
      polygon.setMap(map);
    });
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCfRoXEZIuzNchjkbTYFjDn-XL3N3dQ41k" // Your Google Maps API Key
      libraries={['drawing']} // Drawing library needed
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onMapLoad}
      >
        {/* Drawing Manager */}
        <DrawingManager
          onPolygonComplete={(polygon) => {
            setPolygons((prevPolygons) => [...prevPolygons, polygon]);
            polygon.setEditable(true); // Enable editing on complete
          }}
          drawingMode={isPolygonMode ? google.maps.drawing.OverlayType.POLYGON : null}
          options={{
            drawingControl: isPolygonMode, // Only show controls in polygon mode
            polygonOptions: {
              fillColor: '#FF0000',
              fillOpacity: 0.5,
              strokeWeight: 2,
            },
          }}
        />
        {/* Optional: Add a marker to the map */}
        <Marker position={center} />
      </GoogleMap>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsPolygonMode((prev) => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isPolygonMode ? 'Cancel Drawing' : 'Draw Polygon'}
        </button>
        <button
          onClick={savePolygons}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Save Polygons
        </button>
      </div>
    </LoadScript>
  );
};

export default GoogleMapComponentDivide;
