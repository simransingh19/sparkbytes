import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Input,
  Button,
  List,
  Rate,
  message,
  Row,
  Col,
  Divider,
  Space,
  Avatar,
  Tag,
  Spin,
} from "antd";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

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
  foodCounter?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface DistanceInfo {
  distance: string;
  duration: string;
  loading: boolean;
}

// Used to get query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EventDetailPage: React.FC = () => {
  const query = useQuery();
  const eventId = query.get("id");
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [eventCoordinates, setEventCoordinates] = useState<UserLocation | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo>({
    distance: "",
    duration: "",
    loading: false,
  });
  // Set the Mapbox token directly
  const mapboxToken = "pk.eyJ1IjoieXVyaWJ5Y2hrb3YiLCJhIjoiY205ZDd2aTFnMHllZzJsb2Q3ZnFtZ213YSJ9.VUpx2g33DE11JKVF-Cw3AA";

  const [foodCounter, setFoodCounter] = useState(0);
  const [isHost, setIsHost] = useState(false);


  useEffect(() => {
    if (eventData?.foodCounter !== undefined) {
      setFoodCounter(eventData.foodCounter);
    }
  }, [eventData]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          message.warning("Could not access your location. Distance calculations will be unavailable.");
        }
      );
    } else {
      message.warning("Geolocation is not supported by your browser.");
    }
  }, []);

  // Fetch event data
  useEffect(() => {
    if (!eventId) return;
    
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "Events", eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
          const data = eventSnap.data() as EventData;
          setEventData({ id: eventSnap.id, ...data });

          if (data.userId && user?.uid) {
            setIsHost(data.userId === user.uid); // <-- check if current user is the host
          }
          
          // Geocode the event address to get coordinates
          if (data.EventLocation) {
            geocodeEventAddress(data.EventLocation);
          }
        } else {
          message.error("Event not found.");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        message.error("Failed to load event details.");
      }
    };

    fetchEvent();
  }, [eventId, db]);

  // Fetch comments
  useEffect(() => {
    if (!eventId) return;
    
    const fetchComments = async () => {
      try {
        const commentsRef = collection(db, "Events", eventId, "Comments");
        const commentSnapshot = await getDocs(commentsRef);
        const fetchedComments = commentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setComments(
          fetchedComments.sort(
            (a, b) => b.timestamp.seconds - a.timestamp.seconds
          )
        );

        if (user) {
          const reviewed = fetchedComments.some(
            (comment) => comment.userId === user.uid
          );
          setHasReviewed(reviewed);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        message.error("Failed to load comments.");
      }
    };

    fetchComments();
  }, [eventId, db, user]);

  // Calculate distance when both locations are available
  useEffect(() => {
    if (userLocation && eventCoordinates) {
      calculateDistance(userLocation, eventCoordinates);
    }
  }, [userLocation, eventCoordinates]);

  // Geocode the event address to get coordinates
  const geocodeEventAddress = async (location: any) => {
    if (!location) return;
    
    const { street, city, state, zipcode, country } = location;
    if (!street || !city) return;
    
    setDistanceInfo(prev => ({ ...prev, loading: true }));
    
    try {
      const addressString = `${street}, ${city}, ${state || ""} ${zipcode || ""}, ${country || "USA"}`;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          addressString
        )}.json?access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        
        // Store the coordinates in state
        setEventCoordinates({
          latitude,
          longitude
        });
      } else {
        message.warning("Could not find coordinates for event location");
        setDistanceInfo(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      message.error("Failed to calculate distance to event");
      setDistanceInfo(prev => ({ ...prev, loading: false }));
    }
  };

  // Calculate distance and duration between user location and event location
  const calculateDistance = async (
    origin: UserLocation,
    destination: UserLocation
  ) => {
    if (!mapboxToken) {
      console.error("Mapbox token is not available");
      return;
    }
    
    setDistanceInfo((prev) => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Convert distance from meters to miles
        const distanceInMiles = (route.distance / 1609.34).toFixed(1);
        
        // Convert duration from seconds to minutes
        const durationInMinutes = Math.round(route.duration / 60);
        
        setDistanceInfo({
          distance: `${distanceInMiles} miles`,
          duration: `${durationInMinutes} minutes`,
          loading: false,
        });
      } else {
        setDistanceInfo({
          distance: "Unavailable",
          duration: "Unavailable",
          loading: false,
        });
        console.error("No routes found");
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      setDistanceInfo({
        distance: "Error",
        duration: "Error",
        loading: false,
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText || rating === 0) {
      message.warning("Please provide both comment and rating.");
      return;
    }
    
    if (!user) {
      message.warning("You must be logged in to leave a review.");
      return;
    }
    
    try {
      const commentData = {
        userId: user.uid,
        username: user.displayName || "Anonymous",
        comment: commentText,
        rating,
        timestamp: Timestamp.now(),
      };
      
      await addDoc(
        collection(db, "Events", eventId as string, "Comments"),
        commentData
      );
      
      message.success("Review submitted successfully!");
      setCommentText("");
      setRating(0);
      setHasReviewed(true);
      
      // Refreshing comments
      const updatedSnapshot = await getDocs(
        collection(db, "Events", eventId as string, "Comments")
      );
      
      setComments(
        updatedSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      );
    } catch (err) {
      console.error("Error adding comment:", err);
      message.error("Failed to submit review. Please try again.");
    }
  };

  // Format event time for display
  const formatEventTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      } else if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      return "Invalid date";
    } catch (e) {
      console.error("Error formatting time:", e);
      return "Invalid date";
    }
  };

  if (!eventData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <Spin size="large" tip="Loading event details..." />
      </div>
    );
  }

  // updating food counter
  const updateFoodCounter = async (eventId: string, newCount: number) => {
    const eventRef = doc(db, "Events", eventId);
    await updateDoc(eventRef, {
      foodCounter: newCount,
    });
  }
  // handling food increments and decrements

  const handleIncrement = async () => {
    const newCount = foodCounter + 1;
    setFoodCounter(newCount);
    await updateFoodCounter(eventData.id, newCount);
  };

  const handleDecrement = async () => {
    if (foodCounter > 0) {
      const newCount = foodCounter - 1;
      setFoodCounter(newCount);
      await updateFoodCounter(eventData.id, newCount);
    }
  };

  return (
    <div style={{ paddingTop: "80px", maxWidth: 800, margin: "0 auto 20px auto" }}>
      {/* Event Details Section */}
      <Card title={<Title level={3}>{eventData.EventName}</Title>} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Paragraph>{eventData.EventDetails}</Paragraph>
          </Col>

          {/* Display food counter */}
          <Col span={24}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <Text strong>Food Items Left:</Text>
              <Text>{foodCounter}</Text>
              {isHost && (
                <Space>
                  <Button onClick={handleIncrement}>Add Food</Button>
                  <Button onClick={handleDecrement} disabled={foodCounter <= 0}>
                    Remove Food
                  </Button>
                </Space>
              )}
            </div>
          </Col>
          
          <Col span={24}>
            <Space direction="vertical" size="small">
              <Space>
                <EnvironmentOutlined />
                <Text strong>Location:</Text>
                <Text>
                  {eventData.EventLocation?.street}
                  {eventData.EventLocation?.apt ? `, Apt ${eventData.EventLocation.apt}` : ""}, 
                  {eventData.EventLocation?.city}, 
                  {eventData.EventLocation?.state} 
                  {eventData.EventLocation?.zipcode}
                </Text>
              </Space>
              
              {eventData.EventTimes && (
                <Space direction="vertical" size={0}>
                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Start:</Text>
                    <Text>{eventData.EventTimes.EventStart ? formatEventTime(eventData.EventTimes.EventStart) : 'N/A'}</Text>
                  </Space>
                  <Space>
                    <ClockCircleOutlined style={{ visibility: 'hidden' }} />
                    <Text strong>End:</Text>
                    <Text>{eventData.EventTimes.EventEnd ? formatEventTime(eventData.EventTimes.EventEnd) : 'N/A'}</Text>
                  </Space>
                </Space>
              )}
              
              {eventData.FoodType && eventData.FoodType.length > 0 && (
                <Space wrap>
                  <Text strong>Food Type:</Text>
                  {eventData.FoodType.map((food, index) => (
                    <Tag key={index} color="blue">{food}</Tag>
                  ))}
                </Space>
              )}
              
              {/* Distance and Time Information */}
              {distanceInfo.loading ? (
                <Space>
                  <Spin size="small" />
                  <Text>Calculating distance...</Text>
                </Space>
              ) : (
                distanceInfo.distance && (
                  <Space direction="vertical" size={0}>
                    <Text strong>Distance from your location:</Text>
                    <Text>{distanceInfo.distance}</Text>
                    <Text strong>Estimated travel time (By Car):</Text>
                    <Text>{distanceInfo.duration}</Text>
                  </Space>
                )
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Review Section */}
      <Card title={<Title level={4}>Leave a Review</Title>} bordered={false}>
        {!user ? (
          <Paragraph>Please log in to leave a review.</Paragraph>
        ) : hasReviewed ? (
          <Paragraph>You've already submitted a review for this event.</Paragraph>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Text>Rate this event:</Text>
              <Rate value={rating} onChange={setRating} />
            </div>
            <TextArea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your experience at this event..."
            />
            <Button type="primary" onClick={handleCommentSubmit} disabled={!rating || !commentText}>
              Submit Review
            </Button>
          </Space>
        )}
      </Card>

      <Divider />

      {/* Comments Section */}
      <Card title={<Title level={4}>Reviews</Title>} bordered={false}>
        <List
          itemLayout="horizontal"
          dataSource={comments}
          locale={{ emptyText: "No reviews yet. Be the first to leave one!" }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={
                  <Avatar>
                    {item.username?.charAt(0).toUpperCase() || "A"}
                  </Avatar>
                }
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 500 }}>{item.username}</span>
                    <Rate disabled value={item.rating} style={{ fontSize: 14 }} />
                    {item.timestamp && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.timestamp.seconds * 1000).toLocaleDateString()}
                      </Text>
                    )}
                  </div>
                }
                description={
                  <div style={{ marginTop: 4, textAlign: "left" }}>
                    {item.comment}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default EventDetailPage;