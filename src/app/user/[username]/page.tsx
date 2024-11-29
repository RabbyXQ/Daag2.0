// app/users/[username]/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Avatar, Card, Descriptions, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UserProfilePage: React.FC = () => {
  const { username } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${username}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        checkFollowing(data.id); // Check if the current user is following this user
      } else {
        message.error(data.error || 'Failed to load user profile.');
        router.push('/user'); // Redirect if user not found
      }
    } catch (error) {
      message.error('Error fetching user profile.');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowing = async (userId: number) => {
    try {
      const response = await fetch(`/api/connections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const connections = await response.json();
      const followingIds = connections.map((connection: any) => connection.folowed);
      setIsFollowing(followingIds.includes(userId));
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  const handleFollowToggle = async () => {
    const method = isFollowing ? 'DELETE' : 'POST';
    try {
      const response = await fetch(`/api/user/${username}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        message.success(isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
      } else {
        const data = await response.json();
        message.error(data.error || 'Failed to update follow status.');
      }
    } catch (error) {
      message.error('Error updating follow status.');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '24px' }}>
      {user ? (
        <Card title={`${user.firstName} ${user.lastName}`} bordered={false}>
          <Avatar
            size={100}
            src={user.avatar}
            icon={<UserOutlined />}
            alt={user.username}
            style={{ marginBottom: '16px' }}
          />
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Occupation">{user.occupation || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Age">{user.age || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Address">{user.address || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Social Profiles">
              {user.facebook && <a href={user.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
              {user.twitter && <a href={user.twitter} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>Twitter</a>}
              {user.linkedIn && <a href={user.linkedIn} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>LinkedIn</a>}
            </Descriptions.Item>
          </Descriptions>
          <Button type={isFollowing ? 'default' : 'primary'} onClick={handleFollowToggle}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        </Card>
      ) : (
        <p>User not found</p>
      )}
    </div>
  );
};

export default UserProfilePage;
