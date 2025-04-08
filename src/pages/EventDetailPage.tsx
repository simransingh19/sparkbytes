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
} from "antd";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const { Title, Paragraph } = Typography;
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
}

// Used to get query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EventDetailPage = () => {
  const query = useQuery();
  const eventId = query.get("id");
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [eventData, setEventData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "Events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEventData(eventSnap.data());
        } else {
          message.error("Event not found.");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsRef = collection(
          db,
          "Events",
          eventId as string,
          "Comments"
        );
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
      }
    };

    fetchEvent();
    fetchComments();
  }, [eventId, db]);

  const handleCommentSubmit = async () => {
    if (!commentText || rating === 0) {
      message.warning("Please provide both comment and rating.");
      return;
    }
    try {
      const commentData = {
        userId: user?.uid,
        username: user?.displayName,
        comment: commentText,
        rating,
        timestamp: Timestamp.now(),
      };
      await addDoc(
        collection(db, "Events", eventId as string, "Comments"),
        commentData
      );
      message.success("Comment added!");
      setCommentText("");
      setRating(0);
      // Refreshing comments
      const updatedSnapshot = await getDocs(
        collection(db, "Events", eventId as string, "Comments")
      );
      setComments(
        updatedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to add comment.");
    }
  };

  if (!eventData) return <Paragraph>Loading event details...</Paragraph>;

  return (
    <div
      style={{ paddingTop: "80px", maxWidth: 800, margin: "0 auto 20px auto" }}
    >
      {/* Event Details Section */}
      <Card title={eventData.EventName} bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Paragraph>
              <strong>Details:</strong> {eventData.EventDetails}
            </Paragraph>
          </Col>
          <Col span={24}>
            <Paragraph>
              <strong>Location:</strong> {eventData.EventLocation?.street},{" "}
              {eventData.EventLocation?.city}
            </Paragraph>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Review Section */}
      <Card title="Leave a Review" bordered={false}>
        {hasReviewed ? (
          <Paragraph>You’ve already submitted a review.</Paragraph>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Rate value={rating} onChange={setRating} />
            <TextArea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment here..."
            />
            <Button type="primary" onClick={handleCommentSubmit}>
              Submit
            </Button>
          </Space>
        )}
      </Card>

      <Divider />

      {/* Comments Section */}
      <Card title="Comments" bordered={false}>
        <List
          itemLayout="horizontal"
          dataSource={comments}
          locale={{ emptyText: "No comments yet" }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={
                  <Avatar>
                    {item.username?.charAt(0).toUpperCase() || "A"}
                  </Avatar>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.username}</span>
                    <Rate
                      disabled
                      value={item.rating}
                      style={{ fontSize: 14 }}
                    />
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
