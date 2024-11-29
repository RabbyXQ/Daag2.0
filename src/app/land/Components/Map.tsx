import React, { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, LoadScript, Polygon, DrawingManager } from "@react-google-maps/api";
import { Button, Card, Select, notification } from "antd";
import { EditOutlined, DeleteOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';

interface MapProps {
  id: number;
}

const { Option } = Select;

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: -3.745,
  lng: -38.523,
};

const Map: React.FC<MapProps> = ({ id }) => {
  const [polygons, setPolygons] = useState<google.maps.LatLngLiteral[][]>([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const polygonRefs = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    const fetchPolygons = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/land/${id}`);
        const { polygons } = response.data;
        console.log('Fetched polygons:', polygons);

        // Ensure polygons is an array
        if (Array.isArray(polygons)) {
          setPolygons(polygons);
        } else {
          setPolygons([]);
          console.warn('Polygons data is invalid or not an array');
        }

        if (polygons.length > 0) {
          const firstPoint = polygons[0][0];
          console.log('First polygon point:', firstPoint);
          mapRef?.setCenter(new google.maps.LatLng(firstPoint.lat, firstPoint.lng));
          mapRef?.setZoom(14);
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const location = { lat: latitude, lng: longitude };
              setCurrentLocation(location);
              mapRef?.setCenter(location);
              mapRef?.setZoom(14);
            },
            (error) => {
              console.error("Error getting current location:", error);
              mapRef?.setCenter(defaultCenter);
            }
          );
        }
      } catch (error) {
        console.error("Error fetching polygon data:", error);
        mapRef?.setCenter(defaultCenter);
      }
    };

    fetchPolygons();
  }, [id, mapRef]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
    console.log('Map loaded:', map);
  }, []);

  const onUnmount = useCallback(() => {
    setMapRef(null);
    console.log('Map unmounted');
  }, []);

  const handleMarkCurrentLocation = () => {
    if (currentLocation && mapRef) {
      mapRef.setCenter(new google.maps.LatLng(currentLocation.lat, currentLocation.lng));
      mapRef.setZoom(14);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          if (mapRef) {
            mapRef.setCenter(new google.maps.LatLng(latitude, longitude));
            mapRef.setZoom(14);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          if (mapRef) {
            mapRef.setCenter(defaultCenter);
          }
        }
      );
    }
  };

  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray();
    console.log('Polygon completed:', path);
    const newPolygon = path.map(point => ({
      lat: point.lat(),
      lng: point.lng(),
    }));
    setPolygons(prevPolygons => [...prevPolygons, newPolygon]);
    polygonRefs.current.push(polygon);
  }, []);

  const handlePolygonChange = () => {
    if (selectedPolygonIndex !== null && polygonRefs.current[selectedPolygonIndex]) {
      const updatedPolygons = [...polygons];
      const currentPolygon = polygonRefs.current[selectedPolygonIndex];
      const path = currentPolygon.getPath();
      updatedPolygons[selectedPolygonIndex] = path.getArray().map(point => ({
        lat: point.lat(),
        lng: point.lng(),
      }));
      console.log('Updated polygons:', updatedPolygons);
      setPolygons(updatedPolygons);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handlePolygonChange();
    }
    setIsEditing(!isEditing);
  };

  const handleUpdate = async () => {
    try {
      notification.info({
        message: 'Updating...',
        description: 'Polygons are being saved, please wait...',
        duration: 2,
      });

      console.log('Saving polygons:', polygons);
      await axios.put(`http://localhost:3000/land/${id}`, { polygons });

      notification.success({
        message: 'Saving Successful',
        description: 'Polygons saved successfully!',
        duration: 2,
      });
    } catch (error) {
      console.error("Error updating polygons:", error);
      notification.error({
        message: 'Saving Failed',
        description: 'An error occurred while updating polygons.',
        duration: 2,
      });
    }
  };

  const handleDelete = async () => {
    if (selectedPolygonIndex !== null) {
      try {
        notification.info({
          message: 'Deleting...',
          description: 'Polygon is being deleted, please wait...',
          duration: 2,
        });

        const updatedPolygons = polygons.filter((_, index) => index !== selectedPolygonIndex);
        setPolygons(updatedPolygons);

        const polygonToRemove = polygonRefs.current[selectedPolygonIndex];
        if (polygonToRemove) {
          polygonToRemove.setMap(null);
        }

        await axios.put(`http://localhost:3000/land/${id}`, { polygons: updatedPolygons });

        notification.success({
          message: 'Delete Successful',
          description: 'Polygon deleted successfully!',
          duration: 2,
        });
      } catch (error) {
        console.error("Error deleting polygon:", error);
        notification.error({
          message: 'Delete Failed',
          description: 'An error occurred while deleting the polygon.',
          duration: 2,
        });
      }
    }
  };

  const handleSelectPolygon = (index: number) => {
    setSelectedPolygonIndex(index);
    if (mapRef && polygons[index]) {
      const bounds = new google.maps.LatLngBounds();
      polygons[index].forEach(point => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      });
      mapRef.fitBounds(bounds);
      mapRef.setZoom(14);
    }
  };

  return (
    <Card style={{ padding: '16px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select
            placeholder="Select polygon"
            style={{ marginRight: '16px' }}
            value={selectedPolygonIndex !== null ? selectedPolygonIndex : undefined}
            onChange={value => handleSelectPolygon(value as number)}
          >
            {polygons.map((_, index) => (
              <Option key={index} value={index}>
                Polygon {index + 1}
              </Option>
            ))}
          </Select>
          <Button onClick={handleEditToggle} type="default" icon={<EditOutlined />} style={{ marginRight: '16px' }}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <>
              <Button onClick={handleUpdate} type="primary" icon={<SaveOutlined />} style={{ marginLeft: '8px' }}>
                Save
              </Button>
              <Button onClick={handleDelete} icon={<DeleteOutlined />} style={{ backgroundColor: 'red', color: 'white', marginLeft: '8px' }}>
                Delete
              </Button>
            </>
          )}
          <Button
            onClick={handleMarkCurrentLocation}
            type="default"
            icon={<EnvironmentOutlined />}
            style={{ marginLeft: '8px' }}
          >
            Mark Current Location
          </Button>
        </div>
      </div>
      <div style={{ width: '100%', height: '400px' }}>
        <LoadScript googleMapsApiKey="AIzaSyCfRoXEZIuzNchjkbTYFjDn-XL3N3dQ41k" libraries={['drawing']}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation || defaultCenter}
            zoom={14}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {polygons.map((polygon, index) => (
              <Polygon
                key={index}
                paths={polygon}
                options={{ fillColor: 'rgba(0, 123, 255, 0.3)', strokeColor: '#007bff', strokeWeight: 2 }}
                onClick={() => handleSelectPolygon(index)}
              />
            ))}
            <DrawingManager
              onPolygonComplete={handlePolygonComplete}
              options={{
                drawingControlOptions: {
                  drawingModes: ['polygon'],
                },
              }}
            />
          </GoogleMap>
        </LoadScript>
      </div>
    </Card>
  );
};

export default Map;
