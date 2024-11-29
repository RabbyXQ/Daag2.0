// app/users/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { List, Avatar, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        message.error(data.error || 'Failed to load users.');
      }
    } catch (error) {
      message.error('Error fetching users');
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users?action=suggestions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data);
      } else {
        message.error(data.error || 'Failed to load friend suggestions.');
      }
    } catch (error) {
      message.error('Error fetching friend suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSuggestions();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Users</h1>
      <List
        itemLayout="horizontal"
        dataSource={users}
        renderItem={(user: any) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={user.avatar}
                  icon={<UserOutlined />}
                  alt={user.username}
                />
              }
              title={`${user.firstName || ''} ${user.lastName || ''}`}
              description={user.occupation || 'No occupation listed'}
            />
          </List.Item>
        )}
      />

      <h2 style={{ marginTop: '40px' }}>Friend Suggestions</h2>
      <Button onClick={fetchSuggestions} loading={loading}>
        Refresh Suggestions
      </Button>
      <List
        itemLayout="horizontal"
        dataSource={suggestions}
        renderItem={(suggestion: any) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  src={suggestion.avatar}
                  icon={<UserOutlined />}
                  alt={suggestion.username}
                />
              }
              title={`${suggestion.firstName || ''} ${suggestion.lastName || ''}`}
              description={suggestion.occupation || 'No occupation listed'}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default UsersPage;
