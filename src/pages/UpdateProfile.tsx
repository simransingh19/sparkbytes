import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select } from 'antd';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, User, onAuthStateChanged } from 'firebase/auth';
import {useNavigate} from "react-router-dom";

const { Option } = Select;

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
}

const UpdateProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const db = getFirestore();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const docRef = doc(db, 'Users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const fetchedProfile: ProfileData = {
                        profileType: data.profileType || '',
                        addresses: (data.UserData?.Addresses && Array.isArray(data.UserData.Addresses))
                            ? data.UserData.Addresses
                            : [],
                        dietaryRestrictions: data.UserData?.DietaryRestrictions || [],
                        foodPreferences: data.UserData?.FoodPreferences || [],
                    };
                    form.setFieldsValue({
                        profileType: fetchedProfile.profileType,
                        addresses: fetchedProfile.addresses,
                        dietaryRestrictions: fetchedProfile.dietaryRestrictions,
                        foodPreferences: fetchedProfile.foodPreferences,
                    });
                }
            }
        });
        return () => unsubscribe();
    }, [db, form]);

    const handleSubmit = async (values: any) => {
        if (!user) return;
        setLoading(true);
        try {
            const cleanedAddresses = (values.addresses || []).map((addr: any) => ({
                street: addr.street,
                ...(addr.apt ? { apt: addr.apt } : {}),
                city: addr.city,
                state: addr.state,
                zipcode: addr.zipcode,
                country: addr.country,
            }));

            const updatedData: ProfileData = {
                profileType: values.profileType,
                addresses: cleanedAddresses,
                dietaryRestrictions: values.dietaryRestrictions || [],
                foodPreferences: values.foodPreferences || [],
            };

            console.log('Updated Data:', updatedData);

            const userDocRef = doc(db, 'Users', user.uid);
            const dataToSave = {
                profileType: updatedData.profileType,
                UserData: {
                    Addresses: updatedData.addresses,
                    DietaryRestrictions: updatedData.dietaryRestrictions,
                    FoodPreferences: updatedData.foodPreferences,
                },
            };


            await setDoc(userDocRef, dataToSave, { merge: true });
            alert('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div style = {{padding: "10vh"}} >
        <Card style={{ width: 500, margin: '0 auto' }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Account Type" name="profileType" rules={[{ required: true }]}>
                    <Select placeholder="Select Account Type">
                        <Select.Option value="Attendee">Attendee</Select.Option>
                        <Select.Option value="Host">Host</Select.Option>
                    </Select>
                </Form.Item>
                <Form.List name="addresses">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Card key={field.key} type="inner" style={{ marginBottom: '1rem' }}>
                                    <Form.Item
                                        {...field}
                                        label="Street Number & Name"
                                        name={[field.name, 'street']}
                                        rules={[{ required: true, message: 'Please enter street number and name.' }]}
                                    >
                                        <Input placeholder="e.g., 123 Main St" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        label="Apartment/Unit"
                                        name={[field.name, 'apt']}
                                    >
                                        <Input placeholder="Apartment or Unit (optional)" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        label="City"
                                        name={[field.name, 'city']}
                                        rules={[{ required: true, message: 'Please enter a city.' }]}
                                    >
                                        <Input placeholder="City" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        label="State"
                                        name={[field.name, 'state']}
                                        rules={[{ required: true, message: 'Please enter a state.' }]}
                                    >
                                        <Input placeholder="State" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        label="Zipcode"
                                        name={[field.name, 'zipcode']}
                                        rules={[{ required: true, message: 'Please enter a zipcode.' }]}
                                    >
                                        <Input placeholder="Zipcode" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        label="Country"
                                        name={[field.name, 'country']}
                                        rules={[{ required: true, message: 'Please enter a country.' }]}
                                    >
                                        <Input placeholder="Country" />
                                    </Form.Item>
                                    <Button type="link" onClick={() => remove(field.name)}>
                                        Remove Address
                                    </Button>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                    Add Address
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Form.Item label="Dietary Restrictions" name="dietaryRestrictions">
                    <Select mode="multiple" placeholder="Select food preferences" allowClear>
                        <Option value="Vegetarian">Vegetarian</Option>
                        <Option value="Vegan">Vegan</Option>
                        <Option value="Gluten Free">Gluten Free</Option>
                        <Option value="Lactose Free">Lactose Free</Option>
                        <Option value="Halal">Halal</Option>
                        <Option value="Kosher">Kosher</Option>
                        <Option value="Nut Allergy">Nut Allergy</Option>
                        <Option value="Fish Allergy">Fish Allergy</Option>
                        <Option value="Shellfish Allergy">Shellfish Allergy</Option>
                        <Option value="Soy Allergy">Soy Allergy</Option>
                        <Option value="Pescatarian">Pescatarian</Option>
                        <Option value="Wheat Allergy">Wheat Allergy</Option>
                        <Option value="Egg Free">Egg Free</Option>
                        <Option value="Paleo Diet">Paleo Diet</Option>
                        <Option value="Keto Diet">Meals</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Food Preferences" name="foodPreferences">
                    <Select mode="multiple" placeholder="Select food preferences" allowClear>
                        <Option value="Snacks">Snacks</Option>
                        <Option value="Small Bites">Small Bites</Option>
                        <Option value="Meals">Meals</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Update Profile
                    </Button>
                </Form.Item>
            </Form>
        </Card>
        </div>
    );
};

export default UpdateProfile;
