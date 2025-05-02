import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Paragraph, Text } = Typography;

const About: React.FC = () => {
  return (
    <div
      style={{
        padding: '24px',
        marginTop: '80px',
        backgroundColor: '#fff',
        color: '#000',
        borderRadius: '8px',
        maxWidth: '1000px',
        margin: '80px auto 24px auto',
      }}
    >
      <Typography style={{ color: '#000', textAlign: 'center' }}>
        <Title>About Page</Title>
        <Divider />

        <Title level={2}>Our Mission</Title>
        <Paragraph>
          Spark Bytes is dedicated to addressing two important challenges at Boston University:
          <br />
          reducing food waste from campus events and helping BU community members access free food resources.
        </Paragraph>
        <Divider />

        <Title level={2}>What We Do</Title>
        <Paragraph>
          Every day across Boston University's campus, numerous events provide food and refreshments. Often, these events
          <br />
          end with surplus food that goes to waste. Meanwhile, many students and staff members could benefit from access to these unused resources.
        </Paragraph>
        <Paragraph>Spark Bytes bridges this gap by:</Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • <Text strong>Connecting the BU community with available food resources</Text> – Our platform displays real-time information about events with available food, including what's being served and how much is left.
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • <Text strong>Reducing campus food waste</Text> – By redirecting surplus food to those who can use it, we help decrease the environmental impact of food waste at BU.
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • <Text strong>Creating a more sustainable campus</Text> – We track and display metrics on food waste reduction, helping event organizers make more informed decisions about quantities.
        </Paragraph>
        <Divider />

        <Title level={2}>How It Works</Title>
        <Title level={3}>For Event Hosts</Title>
        <Paragraph style={{ margin: '8px 0' }}>
          • Easily create listings for events with food
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Upload images and descriptions of available food items
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Update food availability in real-time
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Track attendance and engagement through check-ins
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • View impact metrics showing how your events help reduce food waste
        </Paragraph>
        <Title level={3} style={{ marginTop: '24px' }}>For Food Seekers</Title>
        <Paragraph style={{ margin: '8px 0' }}>
          • Browse upcoming events with available food
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Filter events based on dietary preferences and restrictions
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Receive timely notifications about food availability
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Get directions to event locations through integrated maps
        </Paragraph>
        <Paragraph style={{ margin: '8px 0' }}>
          • Provide feedback on events to improve the community experience
        </Paragraph>
        <Divider />

        <Title level={2}>Join Us</Title>
        <Paragraph>
          Whether you're hosting an event or looking for a quick bite, join SparkBytes to help create a more connected and sustainable BU community.
        </Paragraph>
        <Paragraph>
          <i>SparkBytes is a project developed by students in CS391 at Boston University</i>
        </Paragraph>
      </Typography>
    </div>
  );
};

export default About;
