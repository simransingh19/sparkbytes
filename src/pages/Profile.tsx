import React from 'react';
import { Card, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
      <Card style={{ width: 300, textAlign: 'center' }}>
        <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
        <Title level={3}>John Doe</Title>
        <Paragraph>
          Placeholder Profile Page
        </Paragraph>
      </Card>
    </div>
  );
};

export default Profile;
