import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Upload,
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
//import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const HostEvent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [_user, setUser] = useState<User | null>(null);
  //const [eventImageUrl, setEventImageUrl] = useState<string>('');
  const db = getFirestore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  //const storage = getStorage();

  // fills hoster and email fields from the authenticated user.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        form.setFieldsValue({
          hoster: currentUser.displayName || '',
          email: currentUser.email || '',
        });
      }
    });
    return () => unsubscribe();
  }, [form]);

  // uploads image to firebase
  /*
    const uploadImg = async ({ file, onSuccess, onError }: any) => {
        try {
            const storageRef = ref(storage, `eventImages/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload progress: ${progress.toFixed(2)}%`);
                },
                (error) => {
                    console.error('Upload error:', error);
                    onError(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('Retrieved download URL:', downloadURL);
                        setEventImageUrl(downloadURL);
                        onSuccess({ url: downloadURL });
                    } catch (downloadError) {
                        console.error('Error retrieving download URL:', downloadError);
                        onError(downloadError);
                    }
                }
            );
        } catch (error) {
            console.error('Error in image upload:', error);
            onError(error);
        }
    };

     */

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const eventStart = values.eventStart.toDate();
      const eventEnd = values.eventEnd.toDate();

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User is not signed in.');
      }

      const eventData = {
        userId: currentUser.uid,
        Hoster: values.hoster,
        Email: values.email,
        EventName: values.eventName,
        EventLocation: {
          street: values.eventLocation.street,
          apt: values.eventLocation.apt || "",
          city: values.eventLocation.city,
          state: values.eventLocation.state,
          zipcode: values.eventLocation.zipcode,
          country: values.eventLocation.country,
        },
        FoodType: values.foodType,
        EventTimes: {
          EventStart: eventStart,
          EventEnd: eventEnd,
        },
        EventDetails: values.eventDetails || "",
        //EventImage: eventImageUrl || '',
      };

      // create a new document in the events collection then reroute to the eventspage
      await addDoc(collection(db, 'Events'), eventData);
      alert('Event created successfully!');
      navigate('/eventspage');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{padding: "10vh"}}>
      <Card style={{margin: "20px auto", width: "30vw"}}>
        <Title level={2}>Host Event</Title>
        <Paragraph>Fill in the details below to create a new event.</Paragraph>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          style={{ paddingLeft: "2vw", paddingRight: "2vw" }}
        >
          <Title level={4}>Host Details</Title>
          <Form.Item
            label="Hoster"
            name="hoster"
            rules={[{ required: true, message: "Hoster name is required." }]}
            style={{ margin: "20px auto", width: "50%" }}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required." },
              { type: "email", message: "Enter a valid email." },
            ]}
            style={{ margin: "20px auto", width: "50%" }}
          >
            <Input disabled />
          </Form.Item>
          <Title level={4}>Event Name</Title>
          <Form.Item
            label="Event Name"
            name="eventName"
            rules={[
              { required: true, message: "Please enter the event name." },
            ]}
          >
            <Input placeholder="e.g., SparkBytes Hackathon" />
          </Form.Item>
          {/* event location details */}
          <Title level={4}>Event Location</Title>
          <Form.Item
            label="Street Number & Name"
            name={["eventLocation", "street"]}
            rules={[
              {
                required: true,
                message: "Please enter street number and name.",
              },
            ]}
          >
            <Input placeholder="e.g., 123 Main St" />
          </Form.Item>
          <Form.Item label="Apartment/Unit" name={["eventLocation", "apt"]}>
            <Input placeholder="Apartment or Unit (optional)" />
          </Form.Item>
          <Form.Item
            label="City"
            name={["eventLocation", "city"]}
            rules={[{ required: true, message: "Please enter the city." }]}
          >
            <Input placeholder="City" />
          </Form.Item>
          <Form.Item
            label="State"
            name={["eventLocation", "state"]}
            rules={[{ required: true, message: "Please enter the state." }]}
          >
            <Input placeholder="State" />
          </Form.Item>
          <Form.Item
            label="Zipcode"
            name={["eventLocation", "zipcode"]}
            rules={[{ required: true, message: "Please enter the zipcode." }]}
          >
            <Input placeholder="Zipcode" />
          </Form.Item>
          <Form.Item
            label="Country"
            name={["eventLocation", "country"]}
            rules={[{ required: true, message: "Please enter the country." }]}
          >
            <Input placeholder="Country" />
          </Form.Item>

          {/* event info */}
          <Title level={4}>Event Info</Title>
          <Form.Item
            label="Food Type"
            name="foodType"
            rules={[
              { required: true, message: "Please select the food type." },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select food preferences"
              allowClear
            >
              <Option value="Snacks">Snacks</Option>
              <Option value="Small Bites">Small Bites</Option>
              <Option value="Meals">Meals</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Event Start"
            name="eventStart"
            rules={[
              {
                required: true,
                message: "Please select the event start time.",
              },
            ]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Event End"
            name="eventEnd"
            rules={[
              { required: true, message: "Please select the event end time." },
            ]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Event Description/Details" name="eventDetails">
            <Input.TextArea rows={4} placeholder="Optional event details" />
          </Form.Item>

          {/*
                    <Form.Item label="Event Image (optional)">
                        <Upload customRequest={uploadImg} showUploadList={false}>
                            <Button icon={<UploadOutlined/>}>Upload Image</Button>
                        </Upload>
                        {eventImageUrl && (
                            <img src={eventImageUrl} alt="Event" style={{marginTop: '10px', maxWidth: '100%'}}/>
                        )}
                    </Form.Item>
                    */}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Event
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default HostEvent;
