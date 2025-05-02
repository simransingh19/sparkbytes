import React, {useEffect, useRef, useState} from 'react';
import logoImage from '/src/assets/sparkBytes_teal_white_text_shadow 1.png'
import mapboxgl from 'mapbox-gl';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import {signInWithGoogle} from "../authentication.tsx";
import {Button, Card} from "antd";
import { DownCircleOutlined } from '@ant-design/icons'


mapboxgl.accessToken = "pk.eyJ1IjoieXVyaWJ5Y2hrb3YiLCJhIjoiY205ZDd2aTFnMHllZzJsb2Q3ZnFtZ213YSJ9.VUpx2g33DE11JKVF-Cw3AA";

interface EventLocation {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
}

interface EventData {
    id: string;
    EventLocation: EventLocation;
    EventName: string;
    EventTimes: {
        EventStart: Date;
        EventEnd: Date;
    };
}

const dateTimeOpts: Intl.DateTimeFormatOptions = {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
};


const Home: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<mapboxgl.Map>();
    const [events, setEvents] = useState<EventData[]>([]);
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const eventsSection = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, u => setUser(u));
        return () => unsub();
    }, []);

    useEffect(() => {
        const db = getFirestore();
        const fetchEvents = async () => {
            const now = new Date();
            const q = query(
                collection(db, 'Events'),
                where('EventTimes.EventEnd', '>', now)
                );
            const snap = await getDocs(q);
            const evs: EventData[] = snap.docs.map(d => ({
                id: d.id,
                EventLocation: d.data().EventLocation as EventLocation,
                EventName: d.data().EventName || 'Untitled',
                EventTimes: {
                    EventStart: (d.data().EventTimes?.EventStart as any).toDate(),
                    EventEnd:   (d.data().EventTimes?.EventEnd as any).toDate(),
                },
            }));
            setEvents(evs);
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!mapContainer.current) return;

        mapInstance.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/navigation-night-v1',
            center: [-71.109, 42.351],
            zoom: 12,
        });

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = undefined;
        };
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !user) return;

        events.forEach(async (evt) => {
            const loc = evt.EventLocation;
            const address = encodeURIComponent(
                `${loc.street}${loc.apt ? ' ' + loc.apt : ''}, ${loc.city}, ${loc.state} ${loc.zipcode}, ${loc.country}`
            );
            try {
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${mapboxgl.accessToken}`
                );
                const data = await res.json();
                if (!data.features?.length) return;

                const [lng, lat] = data.features[0].center;
                const startStr = evt.EventTimes.EventStart.toLocaleString(undefined, dateTimeOpts);
                const endStr = evt.EventTimes.EventEnd.toLocaleString(undefined, dateTimeOpts);

                const popupHtml = `
          <div style="padding:10px">
            <div style="font-size:16px;font-weight:bold;color:#6A0DAD;">
              ${evt.EventName}
            </div>
            <div style="font-size:12px;color:#555;margin-top:4px;">
              ${loc.street}
            </div>
            <div style="font-size:12px;color:#888;font-style:italic;margin-top:4px;">
              Start: ${startStr}<br/>End: ${endStr}
            </div>
            <button
              id="details-btn-${evt.id}"
              style="
                margin-top:8px;
                padding:6px 12px;
                background:#6A0DAD;
                color:#fff;
                border:none;
                border-radius:4px;
                font-size:12px;
                cursor:pointer;
              "
            >View Details</button>
          </div>
        `;
                const popup = new mapboxgl.Popup({ offset: 25, className: 'event-popup' })
                    .setHTML(popupHtml);

                new mapboxgl.Marker({ color: '#6A0DAD' })
                    .setLngLat([lng, lat])
                    .setPopup(popup)
                    .addTo(mapInstance.current!);

                popup.on('open', () => {
                    const btn = document.getElementById(`details-btn-${evt.id}`);
                    btn?.addEventListener('click', () => navigate(`/eventdetail?id=${evt.id}`));
                });
            } catch (err) {
                console.error('Geocoding error for', evt.id, err);
            }
        });
    }, [events, user, navigate]);

    //

    const scrollToEvents = () => {
        eventsSection.current?.scrollIntoView( {behavior: 'smooth'});
    };

    {/* Landing Page Features + dynamic linked pointer */}

    return (
        <div style={{
        }}
        >
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 20px'
        }}>
            <img
                src={logoImage}
                alt = "SparkBytes Logo"
                style={{
                    width: '100%',
                    maxWidth: '10000px',
                    marginTop: '70px',
                    marginBottom: '40px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
            />

        </div>

        <div
            style={{
                position: 'absolute',
                bottom: '30px',
                cursor: 'pointer',
                animation: 'bounce 2s infinite',
                alignContent: 'center',
                justifyContent: 'center',
                position: 'relative'

            }}
            onClick={scrollToEvents}
            
            >
                <DownCircleOutlined
                    style={{
                        fontSize: '24px',
                        color: '#fff',

                    }}
                    onClick={() => navigate('/eventspage')}
                />

                <style jsx> {`
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100%, {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-15px);
                        }
                        60% {
                            transform: translateY(-7px)};
                        }
                    }
                `}</style>

        </div>

        <div style={{ color: 'white' , padding: '20px', marginTop: '20px' }}>
            <div style={{
                fontFamily: " Helvetica ",
                marginTop: '50px'
            }}>
                <h1>
                    <i>
                    Welcome to SparkBytes!
                    </i>
                </h1>
                <h2>
                Our goal is to connect the BU Community with on‑campus events that are trying to eliminate food waste
                </h2>
                <h2>Check out some of our upcoming events!</h2>
            </div>


            <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                textAlign: 'center',
            }}>
                <h1>UPCOMING EVENTS</h1>
                {!user && (
                    <Card style={{ margin: '20px auto', width: 300, textAlign: 'center' }}>
                        <p>Please sign in to view events on the map</p>
                        <Button type="primary" onClick={signInWithGoogle} >
                            Sign in with BU Gmail
                        </Button>
                    </Card>
                )}
            </div>

            <div
                ref={mapContainer}
                style={{
                    height: '500px',
                    width: '80%',
                    margin: '0 auto 50px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            />
        </div>
        </div>
    );

};

export default Home;
