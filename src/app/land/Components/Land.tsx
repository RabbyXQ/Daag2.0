// src/Components/Land.tsx
import React, { useState } from "react";
import { Card, Typography, Row, Col, Space, Button, Input, message } from "antd";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faRuler, faUser, faLandmark, faDollarSign, faStickyNote, faEdit } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface LandProps {
  id: number;
  title: string;
  name: string;
  location: string;
  size: string;
  owner: string;
  land_type: string;
  market_value: string;
  notes?: string;
  add?: boolean;
  view?: boolean;
  onResponse?: (data: any) => void; // Callback function for response data
}

const colorSchemes = {
  light: {
    heading: "#1890ff",
    background: "#ffffff",
    border: "#e0e0e0",
    textColor: "#212529",
    subTextColor: "#6c757d",
  },
  dark: {
    heading: "#1890ff",
    background: "#343a40",
    border: "#495057",
    textColor: "#f8f9fa",
    subTextColor: "#e9ecef",
  },
};

const Land: React.FC<LandProps> = ({
  id,
  title,
  name,
  location,
  size,
  owner,
  land_type,
  market_value,
  notes,
  add = false,
  view = false,
  onResponse
}) => {
  const { t } = useTranslation();
  const [colorMode] = React.useState<'light' | 'dark'>('light');
  const colors = colorSchemes[colorMode];

  // State for editing
  const [editField, setEditField] = useState<string | null>(null);
  const [localName, setLocalName] = useState(name);
  const [localLocation, setLocalLocation] = useState(location);
  const [localSize, setLocalSize] = useState(size);
  const [localOwner, setLocalOwner] = useState(owner);
  const [localLandType, setLocalLandType] = useState(land_type);
  const [localMarketValue, setLocalMarketValue] = useState(market_value);
  const [localNotes, setLocalNotes] = useState(notes || '');

  // Function to get token (from local storage or other secure storage)
  const getToken = () => localStorage.getItem('token'); // Ensure token is stored in localStorage

  const handleSave = async () => {
    const token = getToken(); // Get token
    if (!token) {
      message.error('Unauthorized: No token found');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/api/land/${id}`,
        {
          name: localName,
          location: localLocation,
          size: parseFloat(localSize),
          owner: localOwner,
          landType: localLandType,
          marketValue: parseFloat(localMarketValue),
          notes: localNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to request headers
          },
        }
      );
      if (onResponse) onResponse(response.data); // Call the callback function with response data
      setEditField(null);
      message.success('Land data saved successfully');
    } catch (err) {
      console.error("Error saving land data:", err);
      message.error('Error saving land data');
    }
  };

  const handleSubmit = async () => {
    const token = getToken(); // Get token
    if (!token) {
      message.error('Unauthorized: No token found');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/land`,
        {
          name: localName,
          location: localLocation,
          size: parseFloat(localSize),
          owner: localOwner,
          landType: localLandType,
          marketValue: parseFloat(localMarketValue),
          notes: localNotes,
          polygons: []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to request headers
          },
        }
      );
      if (onResponse) onResponse(response.data); // Call the callback function with response data
      message.success('Land added successfully');
    } catch (err) {
      console.error("Error adding land data:", err);
      message.error('Error adding land data');
    }
  };

  const handleEditClick = (field: string) => {
    setEditField(field);
  };

  return (
    <Card
      title={<Title level={4} style={{ color: colors.heading, textAlign: 'center' }}>{t(title)}</Title>}
      style={{ 
        backgroundColor: colors.background, 
        borderColor: colors.border, 
        padding: '24px',
      }}
      bordered
    >
      {add ? (
        <div>
          <Input placeholder={t("name")} value={localName} onChange={(e) => setLocalName(e.target.value)} style={{ marginBottom: '16px' }} />
          <Input placeholder={t("location")} value={localLocation} onChange={(e) => setLocalLocation(e.target.value)} style={{ marginBottom: '16px' }} />
          <Input placeholder={t("size")} value={localSize} onChange={(e) => setLocalSize(e.target.value)} style={{ marginBottom: '16px' }} />
          <Input placeholder={t("owner")} value={localOwner} onChange={(e) => setLocalOwner(e.target.value)} style={{ marginBottom: '16px' }} />
          <Input placeholder={t("landType")} value={localLandType} onChange={(e) => setLocalLandType(e.target.value)} style={{ marginBottom: '16px' }} />
          <Input placeholder={t("marketValue")} value={localMarketValue} onChange={(e) => setLocalMarketValue(e.target.value)} style={{ marginBottom: '16px' }} />
          <Input placeholder={t("notes")} value={localNotes} onChange={(e) => setLocalNotes(e.target.value)} style={{ marginBottom: '16px' }} />
          <Button type="primary" onClick={handleSubmit}>{t("submit")}</Button>
        </div>
      ) : view ? (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          {[
            { field: "name", label: t("name"), icon: faLandmark, value: localName, setter: setLocalName },
            { field: "location", label: t("location"), icon: faMapMarkerAlt, value: localLocation, setter: setLocalLocation },
            { field: "size", label: t("size"), icon: faRuler, value: localSize, setter: setLocalSize },
            { field: "owner", label: t("owner"), icon: faUser, value: localOwner, setter: setLocalOwner },
            { field: "landType", label: t("landType"), icon: faLandmark, value: localLandType, setter: setLocalLandType },
            { field: "marketValue", label: t("marketValue"), icon: faDollarSign, value: localMarketValue, setter: setLocalMarketValue },
            { field: "notes", label: t("notes"), icon: faStickyNote, value: localNotes, setter: setLocalNotes },
          ].map(({ field, label, icon, value, setter }) => (
            <Row key={field} align="middle" justify="start" style={{ marginBottom: '10px' }}>
              <Col flex="40px">
                <FontAwesomeIcon icon={icon} size="lg" style={{ color: colors.heading }} />
              </Col>
              <Col flex="auto">
                <Row align="middle">
                  <Col flex="auto">
                    {!editField || editField !== field ? (
                      <>
                        <Text strong style={{ color: colors.textColor }}>{label}:</Text>
                        <Text style={{ color: colors.subTextColor, marginLeft: '8px' }}>{value}</Text>
                      </>
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        style={{ marginLeft: '8px', flex: 1 }}
                      />
                    )}
                  </Col>
                  <Col>
                    {!editField || editField !== field ? (
                      <Button
                        type="link"
                        icon={<FontAwesomeIcon icon={faEdit} />}
                        onClick={() => handleEditClick(field)}
                        style={{ marginLeft: '8px' }}
                      />
                    ) : (
                      <Button
                        type="link"
                        onClick={handleSave}
                        style={{ marginLeft: '8px' }}
                      >
                        {t("save")}
                      </Button>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          ))}
        </Space>
      ) : null}
    </Card>
  );
};

export default Land;
