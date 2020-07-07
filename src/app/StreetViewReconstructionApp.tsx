import React, { useState, useEffect } from 'react';
import './StreetViewReconstructionApp.css';
import StreetViewUtility, { StreetViewGeometry, DepthMapCallback, DepthImage, StreetViewDepthMap } from '../utils/StreetViewUtility';

import DepthImageCanvas from '../components/depth-image-canvas/DepthImageCanvas';
import DepthPlanesCanvas from '../components/depth-planes-canvas/DepthPlanesCanvas';
import DepthMapDataDisplay from '../components/depth-map-data-display/DepthMapDataDisplay';
import StreetViewPanorama from '../components/street-view-panorama/StreetViewPanorama';

const LOCATION_STRING = '37.7769799,-122.3949447';
const INITIAL_LATITUDE: number = parseFloat(LOCATION_STRING.split(',')[0]);
const INITIAL_LONGITUDE: number = parseFloat(LOCATION_STRING.split(',')[1]);

const StreetViewReconstructionApp : React.FC<{}> = () => {

    const [depthMap, setDepthMap] = useState<StreetViewDepthMap|undefined>(undefined);
    const [planesData, setPlanesData] = useState<StreetViewGeometry|undefined>(undefined);
    const [depthImage, setDepthImage] = useState<DepthImage|undefined>(undefined);
    const [location, setLocation] = useState<google.maps.LatLng>(new google.maps.LatLng(INITIAL_LATITUDE, INITIAL_LONGITUDE));

    useEffect(() => {
        const loadDataCallback : DepthMapCallback = ([depthMap, depthImage]) => {
            setDepthMap(depthMap);
            setPlanesData(depthMap.geometry);
            setDepthImage(depthImage);
        };

        try {
            StreetViewUtility.fetchStreetViewImage(location.lat(), location.lng(), loadDataCallback);
        } catch (error) {
            // show error message
            console.log(error);
        }
    }, [location]);

    const drawDepthImage = true;
    const drawDepthMap = true;

    const updateLocation = function(latitude: number, longitude: number) : void {
        setLocation(new google.maps.LatLng(latitude, longitude));
    };

    return (
        <div className="App">
            <header className="App-header">
                <label>Latitude: {location.lat()}</label>
                <label>Longitude: {location.lng()}</label>
                <br/>
                {<DepthMapDataDisplay depthMapData={depthMap} />}
                <br/>
                {drawDepthMap && <DepthPlanesCanvas planesData={planesData} />}
                {drawDepthImage && <DepthImageCanvas width={512} height={256} depthImage={depthImage} />}
                <StreetViewPanorama location={location} updateLocation={updateLocation}/>
            </header>
        </div>
    );
};

export default StreetViewReconstructionApp;
