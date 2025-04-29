import { useEffect } from "react";
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
} from "firebase/firestore";

const notifiedEventIds = new Set<string>(); // ✅ persist across mounts

const NewEventListener = ({ notifyApi }: { notifyApi: NotificationInstance }) => {
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const userDocRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const notificationsOn =
        userDoc.exists() && userDoc.data()?.UserData?.Notifications === true;

      if (!notificationsOn) return;

      const eventsRef = collection(db, "Events");

      const unsubscribeSnapshot = onSnapshot(eventsRef, (snapshot) => {
        const now = Timestamp.now();

        const futureEvents = snapshot.docs
          .map((docSnap) => {
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

        const minTime = Math.min(
          ...futureEvents.map((e) => e.EventTimes.EventStart.seconds)
        );

        const nextEvents = futureEvents.filter(
          (e) => e.EventTimes.EventStart.seconds === minTime
        );

        nextEvents.forEach((event) => {
          if (!notifiedEventIds.has(event.id)) {
            notifyApi.open({
              message: "Upcoming Event!",
              description: `${event.EventName} is happening soon. Don't miss it!`,
              duration: 6,
              placement: "bottomRight",
            });
            console.log("🔔 Notified for:", event.id);
            notifiedEventIds.add(event.id);
          }
        });
      });

      return unsubscribeSnapshot;
    });

    return () => unsubscribeAuth();
  }, [notifyApi]);

  return null;
};

export default NewEventListener;
