import React from 'react';

const About: React.FC = () => {
    return (
        <>
            <h1>About Page</h1>

            <h2><u>Our Mission</u></h2>
            <p>
            Spark Bytes is dedicated to addressing two important challenges at Boston University: <br />
            reducing food waste from campus events and helping BU community members access free food resources
            </p>

            <h2><u>What We Do</u></h2>
            <p>
            Every day across Boston University's campus, numerous events provide food and refreshments. Often, these events <br />
            end with surplus food that goes to waste. Meanwhile, many students and staff members could benefit from access to these unused resources.
            </p>

            <p>
            Spark Bytes bridges this gap by: <br />
            <ul>
                <li>
                    <b>Connecting the BU community with available food resources</b> - Our platform displays real-time information about events <br />
                    with available food, including what's being served and how much is left.
                </li>
                <li>
                    <b>Reducing campus food waste</b> - By redirecting surplus food to those who can use it, we help decrease the envrionmental <br />
                    impact of food waste at BU.
                </li>
                <li>
                    <b>Creating a more sustainable campus</b> - We track and display metrics on food waste reduction, helping event organizers  <br />
                    make more informed decisions about quantities.
                </li>
            </ul>
            </p>

            <h2><u>How It Works</u></h2>
            <h3>For Event Hosts</h3>
            <p>
                <ul>
                    <li>Easily create listings for events with food</li>
                    <li>Upload images and descriptions of available food items</li>
                    <li>Update food availability in real-time</li>
                    <li>Track attendance and engagement through check-ins</li>
                    <li>View impact metrics showing how your events help reduce food waste</li>
                </ul>
            </p>
            <h3>For Food Seekers</h3>
            <p>
                <ul>
                    <li>Browse upcoming events with available food</li>
                    <li>Filter events based on dietary preferences and restrictions</li>
                    <li>Receive timely notifications about food availability</li>
                    <li>Get directions to event locations through integrated maps</li>
                    <li>Provide feedback on events to improve the community experience</li>
                </ul>
            </p>

            <h2><u>Join Us</u></h2>
            <p>Whether you're hosting an event or looking for a quick bite, Spark Bytes helps create a more connected and sustainable BU community</p>
            <p><i>SparkBytes is a project developed by students in CS391 at Boston University</i></p>
        </>
    );
};

export default About;
