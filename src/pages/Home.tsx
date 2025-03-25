import React from 'react';
import logoImage from '/Users/simransingh/Downloads/sparkbytes/src/assets/sparkBytesClear.png'

const Home: React.FC = () => {
    return (
        <div style= {{ color: '#6A0DAD'}} >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <img src={logoImage} alt="SparkBytes Logo" 
                style={{
                    width: '1500px',
                    display: 'block',
                }}
                />
            </div>
            <div style={{fontFamily: "'Roboto Mono', monospace",
                        marginTop: '-150px'
            }}>
            <p>Welcome to SparkBytes! Our goal is to connect the BU Community
            with on-campus events that are trying to eliminate food waste</p>
            </div>

        </div>
    );
};

export default Home;
