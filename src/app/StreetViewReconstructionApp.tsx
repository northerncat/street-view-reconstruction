import React, { useState, useEffect } from 'react';
import './StreetViewReconstructionApp.css';
import StreetViewUtility, { StreetViewGeometry, DepthMapCallback, DepthImage, StreetViewDepthMap } from '../utils/StreetViewUtility';

import DepthImageCanvas from '../components/depth-image-canvas/DepthImageCanvas';
import DepthPlanesCanvas from '../components/depth-planes-canvas/DepthPlanesCanvas';
import DepthMapDataDisplay from '../components/depth-map-data-display/DepthMapDataDisplay';
import StreetViewPanorama from '../components/street-view-panorama/StreetViewPanorama';

const LOCATION_STRING = '37.77717636796375,-122.3951574097429';
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

    const updateLocation = (latitude: number, longitude: number) => {
        setLocation(new google.maps.LatLng(latitude, longitude));
    };

    return (
        <div className='App'>
            <header className='App-header'>
                <h2>Reconstrct Depth Maps from Google Street View</h2>
                <h4>Navigate on the Street View Panorama to see the reconstructed depth maps</h4>
                <div className='App-header_info'>
                    <label>Latitude: {location.lat().toFixed(4)}</label>
                    <br/>
                    <label>Longitude: {location.lng().toFixed(4)}</label>
                    {<DepthMapDataDisplay depthMapData={depthMap} />}
                </div>
            </header>
            <div className='App-body'>
                <div className='App-body__depth-maps'>
                  <h4>Detected planes color-coded by index</h4>
                  {drawDepthMap && <DepthPlanesCanvas planesData={planesData} />}
                  <h4>Shaded depth image based on depth</h4>
                  {drawDepthImage && <DepthImageCanvas width={512} height={256} depthImage={depthImage} />}
                </div>
                <div className='App-body__panorama'>
                  <h4>StreeView Panorama</h4>
                  <StreetViewPanorama location={location} updateLocation={updateLocation}/>
                </div>
            </div>
        </div>
    );
};

export default StreetViewReconstructionApp;
