import React from 'react';
import logoImage from '/src/assets/sparkBytes_teal_white_text_shadow 1.png'

const Home: React.FC = () => {
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

        </div>
    );
};

export default Home;
