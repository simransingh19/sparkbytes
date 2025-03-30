import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Form, DatePicker, Input, Select, Modal, message } from 'antd';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '../authentication';
import { EnvironmentOutlined, CalendarOutlined, MailOutlined, UserOutlined, RestOutlined, BarsOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface ProfileData {
    profileType: string;
}

interface EventData {
    id: string;
    Hoster: string;
    Email: string;
    EventName?: string;
    EventDetails?: string;
    EventLocation?: {
        street?: string;
        apt?: string;
        city?: string;
        state?: string;
        zipcode?: string;
        country?: string;
    };
    EventTimes?: {
        EventStart?: any;
        EventEnd?: any;
    };
    FoodType?: string[];
    userId?: string;
}

const EventsPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<ProfileData>({ profileType: '' });
    const [events, setEvents] = useState<EventData[]>([]);
    const db = getFirestore();

    // logic for the editing of events within a modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
    const [editForm] = Form.useForm();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const docRef = doc(db, 'Users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData({
                        profileType: data.profileType || '',
                    });
                }
            } else {
                setProfileData({ profileType: '' });
            }
        });
        return () => unsubscribe();
    }, [db]);

    // Fetch events from db ONLY when the user is authenticated
    useEffect(() => {
        if (!user) return;
        const fetchEvents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Events'));
                const eventsData: EventData[] = [];
                querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                    eventsData.push({
                        id: doc.id,
                        ...(doc.data() as Omit<EventData, 'id'>),
                    });
                });
                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
        fetchEvents();
    }, [db, user]);
    
    // edit modal logic to populate the form with event data
    const openEditModal = (event: EventData) => {
        setEditingEvent(event);
        editForm.setFieldsValue({
            hoster: event.Hoster,
            email: event.Email,
            eventName: event.EventName,
            eventDetails: event.EventDetails,
            eventStart: event.EventTimes?.EventStart ? dayjs(event.EventTimes.EventStart.toDate()) : undefined,
            eventEnd: event.EventTimes?.EventEnd ? dayjs(event.EventTimes.EventEnd.toDate()) : undefined,
            foodType: event.FoodType,
            eventLocation: {
                street: event.EventLocation?.street,
                apt: event.EventLocation?.apt,
                city: event.EventLocation?.city,
                state: event.EventLocation?.state,
                zipcode: event.EventLocation?.zipcode,
                country: event.EventLocation?.country,
            },
        });
        setIsModalOpen(true);
    };
    
    // Handle the submission of the edit form
    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            const updatedEvent = {
                userId: editingEvent?.userId,
                Hoster: editingEvent?.Hoster,
                Email: editingEvent?.Email,
                EventName: values.eventName,
                EventDetails: values.eventDetails,
                FoodType: values.foodType,
                EventTimes: {
                    EventStart: values.eventStart.toDate(),
                    EventEnd: values.eventEnd.toDate(),
                },
                EventLocation: {
                    street: values.eventLocation.street,
                    apt: values.eventLocation.apt || '',
                    city: values.eventLocation.city,
                    state: values.eventLocation.state,
                    zipcode: values.eventLocation.zipcode,
                    country: values.eventLocation.country,
                },
            };
            if (editingEvent) {
                await setDoc(doc(db, 'Events', editingEvent.id), updatedEvent);
                message.success('Event updated successfully!');
                setIsModalOpen(false);
                setEditingEvent(null);
                window.location.reload();
            }
        } catch (error) {
            console.error('Update failed:', error);
            message.error('Failed to update event.');
        }
    };

    return (
        <>
            <Card style={{ margin: '20px auto', width: '80%' }}>
                <Title level={2}>Events Page</Title>
                <Paragraph>
                    Browse upcoming events below. Sign in if you’d like to host or attend an event!
                </Paragraph>
                {user && profileData.profileType.toLowerCase() === 'host' && (
                    <Button type="primary" style={{ marginRight: '1rem' }}>
                        <Link to="/hostevent" style={{ color: '#fff' }}>
                            Host an Event
                        </Link>
                    </Button>
                )}
                {!user && (
                    <Button type="primary" onClick={signInWithGoogle}>
                        You are not logged in. Click here to sign in with Google
                    </Button>
                )}
            </Card>

            {user && (
                <div style={{ width: '70%', margin: '0 auto', marginTop: '20px' }}>
                    {events.map((event) => {
                        let eventStart = '';
                        let eventEnd = '';
                        if (event.EventTimes?.EventStart?.toDate) {
                            eventStart = event.EventTimes.EventStart.toDate().toLocaleString();
                        }
                        if (event.EventTimes?.EventEnd?.toDate) {
                            eventEnd = event.EventTimes.EventEnd.toDate().toLocaleString();
                        }
                        return (
                            <Card
                                key={event.id}
                                style={{
                                    marginBottom: '24px',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <Title level={4} style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                    {event.EventName || 'Untitled Event'}
                                </Title>

                                <div style={{ maxWidth: '90%', margin: '0 auto', textAlign: 'left' }}>
                                    <Paragraph style={{ marginBottom: 8 }}>
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        <strong>Host:</strong> {event.Hoster || 'N/A'}
                                    </Paragraph>
                                    <Paragraph style={{ marginBottom: 8 }}>
                                        <MailOutlined style={{ marginRight: 8 }} />
                                        <strong>Contact:</strong> {event.Email}
                                    </Paragraph>
                                    {Array.isArray(event.FoodType) && event.FoodType.length > 0 && (
                                        <Paragraph style={{ marginBottom: 8 }}>
                                            <RestOutlined style={{ marginRight: 8 }} />
                                            <strong>Food:</strong> {event.FoodType.join(', ')}
                                        </Paragraph>
                                    )}
                                    <Paragraph style={{ marginBottom: 8 }}>
                                        <CalendarOutlined style={{ marginRight: 8 }} />
                                        <strong>Start:</strong> {eventStart || 'N/A'}
                                        <br />
                                        <strong>End:</strong> {eventEnd || 'N/A'}
                                    </Paragraph>
                                    {event.EventLocation && (
                                        <Paragraph style={{ marginBottom: 8 }}>
                                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                                            <strong>Location:</strong>
                                            <br />
                                            {event.EventLocation.street}
                                            {event.EventLocation.apt && `, Apt: ${event.EventLocation.apt}`}
                                            <br />
                                            {event.EventLocation.city}, {event.EventLocation.state} {event.EventLocation.zipcode}
                                            <br />
                                            {event.EventLocation.country}
                                        </Paragraph>
                                    )}
                                    {event.EventDetails && (
                                        <Paragraph style={{ marginBottom: 0 }}>
                                            <BarsOutlined style={{ marginRight: 8 }} />
                                            <strong>Details:</strong> {event.EventDetails}
                                        </Paragraph>
                                    )}
                                    {user && user.uid === event.userId && (
                                        <Button type="default" style={{ marginTop: 12 }} onClick={() => openEditModal(event)}>
                                            Edit Event
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                title="Edit Event"
                open={isModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                cancelText="Cancel"
            >
                <Form layout="vertical" form={editForm}>
                    <Form.Item label="Host" name="hoster">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Contact" name="email">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        label="Event Name"
                        name="eventName"
                        rules={[{ required: true, message: 'Please enter the event name.' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Event Description" name="eventDetails">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item label="Food Type" name="foodType">
                        <Select mode="multiple" allowClear>
                            <Option value="Snacks">Snacks</Option>
                            <Option value="Small Bites">Small Bites</Option>
                            <Option value="Meals">Meals</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Event Start"
                        name="eventStart"
                        rules={[{ required: true, message: 'Please select the event start time.' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Event End"
                        name="eventEnd"
                        rules={[{ required: true, message: 'Please select the event end time.' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    <Title level={5}>Location</Title>
                    <Form.Item label="Street" name={['eventLocation', 'street']} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Apartment" name={['eventLocation', 'apt']}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="City" name={['eventLocation', 'city']} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="State" name={['eventLocation', 'state']} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Zipcode" name={['eventLocation', 'zipcode']} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Country" name={['eventLocation', 'country']} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default EventsPage;
