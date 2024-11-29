'use client';

import React, { useState, useEffect } from 'react';
import { List, Card, Button, Spin, Checkbox, Typography, message } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import Link from 'next/link';

const { Title } = Typography;

const Lands = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLands = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/land', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched lands response:', response.data);
        setLands(response.data);
      } catch (error) {
        console.error('Error fetching lands:', error);
        message.error('Failed to load lands data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/land/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Land deleted successfully.');
      setLands(prevLands => prevLands.filter(land => land.id !== id));
    } catch (error) {
      console.error('Error deleting land:', error);
      message.error('Failed to delete land.');
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: 'auto', marginTop: '50px' }} />;
  }

  if (lands.length === 0) {
    return <div>No lands found.</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Lands</Title>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={lands}
        renderItem={land => (
          <List.Item
            key={land.id}
            actions={[
              <Button onClick={() => handleDelete(land.id)} icon={<DeleteOutlined />}>Delete</Button>,
              <Link href={`/land/${land.id}`}>
                <Button icon={<EyeOutlined />}>View</Button>
              </Link>,
            ]}
          >
            <Checkbox />
            <Card title={land.name}>
              <p>Location: {land.location}</p>
              <p>Size: {land.size} acres</p>
              <p>Market Value: ${land.marketValue.toLocaleString()}</p>
              <p>Created By: {land.createdBy}</p>
              <p>Type: {land.landType}</p>
              <p>Notes: {land.notes}</p>
              <p>Created At: {land.createdAt}</p>
              <p>Updated By: {land.updatedBy}</p>
              <p>Updated At: {land.updatedAt}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Lands;
