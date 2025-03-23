import React, {useEffect, useState} from 'react';
import {Card, Avatar, Typography, Button} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {logout, signInWithGoogle} from "../authentication.tsx";


const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    if (!user) {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Card style={{ margin: '2vw' }}>
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
                </div>
            </>
        );
    }

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}>
                <Card style={{width: 300, textAlign: 'center'}}>
                    <Avatar
                        size={64}
                        src={user.photoURL || undefined}
                        icon={!user.photoURL ? <UserOutlined/> : undefined}
                        style={{marginBottom: 16}}/>
                    <Title level={3}>{user.displayName || 'User'}</Title>
                    <Paragraph>{user.email}</Paragraph>
                </Card>
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
