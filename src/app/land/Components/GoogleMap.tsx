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

const GoogleMapComponent: React.FC<MapProps> = ({ id }) => {
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]); // Store polygons
  const [isPolygonMode, setIsPolygonMode] = useState(false); // Toggle drawing mode
  const mapRef = useRef<google.maps.Map | null>(null); // Reference to map
  const [token, setToken] = useState<string>(''); // Token state
  const [binaryMatrix, setBinaryMatrix] = useState<number[][]>([]); // State to store binary matrix

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

        // Check the fetched polygons
        console.log('Fetched polygons:', landData.polygons);

        const savedPolygons = landData.polygons.map((polygon: { lat: number; lng: number }[]) => {
          const path = polygon.map(({ lat, lng }) => new google.maps.LatLng(lat, lng));

          const googlePolygon = new google.maps.Polygon({
            paths: path,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
          });

          googlePolygon.setMap(mapRef.current);

          return googlePolygon;
        });

        setPolygons(savedPolygons);
      } catch (error) {
        console.error('Error fetching saved polygons:', error);
      }
    };

    fetchSavedPolygons();
  }, [token, id]);

  // Function to create the binary matrix from the polygon
  const createBinaryMatrix = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    
    const bounds = new google.maps.LatLngBounds();
    path.forEach((latLng) => bounds.extend(latLng));

    const minLat = bounds.getSouthWest().lat();
    const maxLat = bounds.getNorthEast().lat();
    const minLng = bounds.getSouthWest().lng();
    const maxLng = bounds.getNorthEast().lng();

    const latStep = (maxLat - minLat) / 50;  // Adjusted step
    const lngStep = (maxLng - minLng) / 50;

    const matrix: number[][] = [];

    // Iterate over the grid (bounding box) and check if each point is inside the polygon
    for (let lat = minLat; lat < maxLat; lat += latStep) {
      const row: number[] = [];
      for (let lng = minLng; lng < maxLng; lng += lngStep) {
        const point = new google.maps.LatLng(lat, lng);

        // Check if the point is inside the polygon
        const isInside = google.maps.geometry.poly.containsLocation(point, polygon);

        // Set 1 for inside the polygon, 0 for outside
        row.push(isInside ? 1 : 0);
      }
      matrix.push(row);
    }

    setBinaryMatrix(matrix); // Update state with the matrix
    console.log('Binary matrix created:', matrix); // Debugging log
  };

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
      createBinaryMatrix(polygon); // Create binary matrix after the polygon is added to the map
    });
  };

  // Function to download the binary matrix as a text file
  const downloadMatrix = () => {
    const matrixText = binaryMatrix.map((row) => row.join(',')).join('\n');
    const blob = new Blob([matrixText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'polygon_binary_matrix.txt';
    link.click();
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyCfRoXEZIuzNchjkbTYFjDn-XL3N3dQ41k" // Your Google Maps API Key
      libraries={['drawing', 'geometry']} // Drawing and geometry libraries needed
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

            // Create and display the binary matrix when a polygon is completed
            createBinaryMatrix(polygon);
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
        <button
          onClick={downloadMatrix}
          className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Download Matrix
        </button>
      </div>

      {/* Display the binary matrix */}
      {binaryMatrix.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Polygon Binary Matrix</h3>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <tbody>
              {binaryMatrix.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`border px-4 py-2 text-center ${cell === 1 ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LoadScript>
  );
};

export default GoogleMapComponent;
