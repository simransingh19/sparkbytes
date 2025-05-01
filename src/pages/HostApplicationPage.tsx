import React, { useEffect, useState } from 'react';
import {Form, Input, Button, notification, Card} from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const HostApplicationPage: React.FC = () => {
    const auth = getAuth();
    const db = getFirestore();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        const u = auth.currentUser;
        if (u?.email) {
            setEmail(u.email);
            form.setFieldsValue({ email: u.email });
        }
    }, [auth.currentUser, form]);

    const onFinish = async (values: { buid: string }) => {
        const buidRegex = /^[Uu]\d{8}$/;
        const emailValid = email.toLowerCase().endsWith('@bu.edu');
        const buidValid = buidRegex.test(values.buid);

        if (!emailValid && !buidValid) {
            form.setFields([{ name: 'buid', errors: ['Invalid BUID or email.'] }]);
            return;
        }

        try {
            setLoading(true);
            const u = auth.currentUser;
            if (!u) throw new Error('Not signed in');

            const userRef = doc(db, 'Users', u.uid);
            await updateDoc(userRef, { profileType: 'Host' });

            notification.success({
                message: 'Success',
                description: 'You are now a Host.',
            });

            navigate('/eventspage');
        } catch (err: any) {
            notification.error({
                message: 'Submission failed',
                description: `${err.code}: ${err.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
            <h2>Apply to Be a Host</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ email }}
            >
                <Form.Item label="Email" name="email">
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="Your BUID"
                    name="buid"
                    rules={[{ required: true, message: 'Please enter your BUID.' }]}
                >
                    <Input placeholder="U12345678" maxLength={9} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
        </Card>
    );
};

export default HostApplicationPage;
