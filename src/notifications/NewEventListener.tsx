import { useEffect, useState } from "react";
import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

interface EventData {
  id: string;
  EventName: string;
  EventTimes: {
    EventStart: Timestamp;
    EventEnd: Timestamp;
  };
  userId: string;
}

const NewEventListener = ({ notifyApi }: { notifyApi: NotificationInstance }) => {
  const [notifiedEventIds, setNotifiedEventIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDocRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const notificationsOn = userDoc.exists() &&
        userDoc.data()?.UserData?.Notifications === true;

      if (!notificationsOn) return;

      const eventsRef = collection(db, "Events");

      const unsubscribeSnapshot = onSnapshot(eventsRef, (snapshot) => {
        const now = Timestamp.now();

        const futureEvents: EventData[] = snapshot.docs
          .map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              EventName: data.EventName,
              EventTimes: data.EventTimes,
              userId: data.userId,
            };
          })
          .filter(
            (event) =>
              event.EventTimes?.EventStart?.seconds > now.seconds &&
              event.userId !== user.uid
          );

        if (futureEvents.length === 0) return;

        // Find the soonest timestamp
        const minTime = Math.min(
          ...futureEvents.map((e) => e.EventTimes.EventStart.seconds)
        );

        // Get all events matching the soonest time
        const nextEvents = futureEvents.filter(
          (e) => e.EventTimes.EventStart.seconds === minTime
        );

        nextEvents.forEach((event) => {
          if (!notifiedEventIds.has(event.id)) {
            notifyApi.open({
              message: "Upcoming Event!",
              description: `${event.EventName} is happening soon. Don't miss it!`,
              duration: 6,
              placement: "topRight",
            });
          }
        });

        // Update state to avoid re-alerting
        setNotifiedEventIds((prev) => {
          const updated = new Set(prev);
          nextEvents.forEach((e) => updated.add(e.id));
          return updated;
        });
      });

      return unsubscribeSnapshot;
    });

    return () => unsubscribeAuth();
  }, [notifyApi]);

  return null;
};

export default NewEventListener;
