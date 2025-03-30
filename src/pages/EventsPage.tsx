import React, { useEffect, useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface ProfileData {
    profileType: string;
}

const EventsPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<ProfileData>({ profileType: '' });
    const db = getFirestore();

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
            }
        });
        return () => unsubscribe();
    }, [db]);

    return (
        <Card style={{ margin: '20px auto', width: '80%' }}>
            <Title level={2}>Events Page</Title>
            <Paragraph>
                This is a placeholder for the events page. More details about upcoming events will be added soon.
            </Paragraph>
            {/* only show the button if the user is signed in and has a host profile type */}
            {user && profileData.profileType.toLowerCase() === 'host' && (
                <Button type="primary">
                    <Link to="/hostevent" style={{ color: '#fff' }}>
                        Host an Event
                    </Link>
                </Button>
            )}
        </Card>
    );
};

export default EventsPage;
