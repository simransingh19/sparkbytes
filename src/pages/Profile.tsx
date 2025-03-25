import React, {useEffect, useState} from 'react';
import {Card, Avatar, Typography, Button} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {logout, signInWithGoogle} from "../authentication.tsx";
import {Link} from "react-router-dom";
import {doc, getDoc, getFirestore} from "firebase/firestore";

const { Title, Paragraph } = Typography;

interface Address {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
}

interface ProfileData {
    profileType: string;
    addresses: Address[];
    dietaryRestrictions: string[];
    foodPreferences: string[];
    notifications: boolean;
}

const defaultProfileData: ProfileData = {
    profileType: '',
    addresses: [],
    dietaryRestrictions: [],
    foodPreferences: [],
    notifications: false,
};

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
    const db = getFirestore();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchProfileData = async () => {
                const docRef = doc(db, 'Users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().UserData) {
                    const data = docSnap.data();
                    setProfileData({
                        profileType: data.profileType || '',
                        addresses: data.UserData.Addresses || [],
                        dietaryRestrictions: data.UserData.DietaryRestrictions || [],
                        foodPreferences: data.UserData.FoodPreferences || [],
                        notifications: data.UserData.Notifications || false, 
                    });
                }
            };
            fetchProfileData();
        }
    }, [user, db]);

    if (!user) {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Card>
                        <Card style={{ margin: '2vw'}}>
                            <Paragraph>
                                If you have an account:
                            </Paragraph>
                            <Button onClick={signInWithGoogle}>
                                Login with Google
                            </Button>
                        </Card>
                        <Card style={{ margin: '2vw' }}>
                            <Paragraph>
                                First time here?
                            </Paragraph>
                            <Button onClick={signInWithGoogle}>
                                Sign Up with Google
                            </Button>
                        </Card>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                <Card style={{width: '100%', textAlign: 'center'}}>
                    <Avatar
                        size={64}
                        src={user.photoURL || undefined}
                        icon={!user.photoURL ? <UserOutlined/> : undefined}
                        style={{marginBottom: 16}}/>

                    <Title level={3}>{user.displayName || 'User'}</Title>

                    <Paragraph>{user.email}</Paragraph>

                    <Title level={4}>{profileData.profileType}</Title>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: 20, }}>

                        <Card title="Addresses" style={{ width: 300 }}>
                            <div style={{ maxHeight: '100px', overflowY: 'auto', justifyContent: 'center'}}>
                                <ul style = {{ padding: 0}}>
                                    {profileData.addresses.length > 0 ? (
                                        profileData.addresses.map((addr, i) => (
                                        <li key={i} style={{ borderBottom: '1px solid lightgrey', margin: '0.5vh'}}>
                                            <div>{addr.street}</div>
                                            {addr.apt && <div>{addr.apt}</div>}
                                            <div>
                                                {addr.city}, {addr.state} {addr.zipcode}
                                            </div>
                                            <div>{addr.country}</div>
                                        </li>
                                        ))
                                    ) : (
                                        <li style = {{ listStyle: 'none'}}>No addresses</li>
                                    )}
                                </ul>
                            </div>
                        </Card>

                        <Card title="Dietary Restrictions" style={{ width: 300 }}>
                            <div style={{maxHeight: '100px', overflowY: 'auto',}}>
                                <ul style = {{ padding: 0}}>
                                    {profileData.dietaryRestrictions.length > 0 ? (
                                        profileData.dietaryRestrictions.map((res, i) => (
                                            <li key={i} style = {{ listStyle: 'none'}}>{res}</li>
                                        ))
                                    ) : (
                                        <li style = {{ listStyle: 'none'}}>No restrictions</li>
                                    )}
                                </ul>
                            </div>
                        </Card>

                        <Card title="Food Preferences" style={{ width: 300 }}>
                            <div style={{maxHeight: '100px', overflowY: 'auto'}}>
                                <ul style = {{ padding: 0}}>
                                    {profileData.foodPreferences.length > 0 ? (
                                        profileData.foodPreferences.map((pref, i) => (
                                            <li key={i} style = {{ listStyle: 'none'}}>{pref}</li>
                                        ))
                                    ) : (
                                        <li style = {{ listStyle: 'none'}} >No preferences</li>
                                    )}
                                </ul>
                            </div>
                        </Card>
                    </div>
                    <Title level={4}>Notifications: 
          
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '4px 9px',
                                borderRadius: '20px',
                                backgroundColor: profileData.notifications ? '#d9f7be' : '#ffd6e7',
                                color: profileData.notifications ? '#389e0d' : '#cf1322',
                                marginLeft: 10,
                                textAlign: 'center',
                            }}
                        >
                            {profileData.notifications ? 'On' : 'Off'}
                        </div>
                    </Title>
                </Card>
            </div>

            <div style={{marginTop: 50}}>
                <Button type="primary">
                    <Link to="/update" style={{color: '#fff'}}>
                        Update Profile
                    </Link>
                </Button>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                <button onClick={logout}>
                    Logout
                </button>
            </div>
        </>
    )
        ;
};

export default Profile;
