import React, {useEffect, useRef, useState} from 'react';
import logoImage from '/src/assets/sparkBytes_teal_white_text_shadow 1.png'
import mapboxgl from 'mapbox-gl';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';

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
        if (!mapContainer.current || !events.length) return;

        if (!mapInstance.current) {
            mapInstance.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [-71.109, 42.351], // BU Boston
                zoom: 12
            });
        }

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
                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center;
                    const startStr = evt.EventTimes.EventStart.toLocaleString(undefined, dateTimeOpts);
                    const endStr   = evt.EventTimes.EventEnd.toLocaleString(undefined, dateTimeOpts);

                    const popupHtml = `
                          <div style="padding-top: 10px; padding-left: 5px; padding-right: 5px">
                                <div style="font-size:16px; font-weight:bold; color:#6A0DAD; margin-top:4px;">
                                  ${evt.EventName}
                                </div>
                                <div style="font-size:12px; color:#555; margin-top:4px;">
                                  ${loc.street}
                                </div>
                                <div style="font-size:12px; color:#888; font-style:italic; margin-top:4px;">
                                  Event Start: ${startStr}
                                  </br> Event End: ${endStr}
                                </div>
                                <a
                                  href="/eventdetail?id=${evt.id}"
                                  style="
                                    display:inline-block;
                                    margin-top:8px;
                                    padding:6px 12px;
                                    background:#6A0DAD;
                                    color:#fff;
                                    text-decoration:none;
                                    border-radius:4px;
                                    font-size:12px;
                                    outline: none;
                                    box-shadow: none;
                                  "
                                >
                                  View Details
                                </a>
                          </div>
                        `;
                    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

                    new mapboxgl.Marker({color: '#6A0DAD'})
                        .setLngLat([lng, lat])
                        .setPopup(popup)
                        .addTo(mapInstance.current!);

                    popup.on('open', () => {
                        const btn = document.getElementById(`details-btn-${evt.id}`);
                        if (btn) {
                            btn.addEventListener('click', () => {
                                navigate(`/eventdetail?id=${evt.id}`);
                            });
                        }
                    });
                }
            } catch (err) {
                console.error('Geocoding error for', evt.id, err);
            }
        });


        return () => {
            mapInstance.current?.remove();
            mapInstance.current = undefined;
        };
    }, [events]);

    return (
        
        <div style= {{ color: '#6A0DAD', padding: '20px', marginTop: '20px', }} >

            <div style={{fontFamily: "'Roboto Mono', monospace",
                        marginTop: '50px'
            }}>
            <h2>Welcome to SparkBytes! Our goal is to connect the BU Community
            with on-campus events that are trying to eliminate food waste</h2>
            <h2>Check out some of our upcoming events!</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '50px', paddingLeft: '10%'}}>
                <img src={logoImage} alt="SparkBytes Logo" 
                style={{
                    width: '80%',
                    display: 'block',
                }}
                />
            </div>
            <div style={{fontFamily: "'Roboto Mono', monospace",
                        textAlign: 'center',
            }}>
            <h1>UPCOMING EVENTS</h1>
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
    );
};

export default Home;
