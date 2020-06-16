import React, { useState, useEffect } from 'react';
import './StreetViewReconstructionApp.css';
import StreetViewUtility, { StreetViewGeometry, DepthMapCallback, DepthImage, StreetViewDepthMap } from '../utils/StreetViewUtility';

import DepthImageCanvas from '../components/depth-image-canvas/DepthImageCanvas';
import DepthPlanesCanvas from '../components/depth-planes-canvas/DepthPlanesCanvas';
import DepthMapDataDisplay from '../components/depth-map-data-display/DepthMapDataDisplay';

const LOCATION_STRING = '37.7769799,-122.3949447';
const LATITUDE: number = parseFloat(LOCATION_STRING.split(',')[0]);
const LONGITUDE: number = parseFloat(LOCATION_STRING.split(',')[1]);

const StreetViewReconstructionApp : React.FC<{}> = () => {

    const [depthMap, setDepthMap] = useState<StreetViewDepthMap|undefined>(undefined);
    const [planesData, setPlanesData] = useState<StreetViewGeometry|undefined>(undefined);
    const [depthImage, setDepthImage] = useState<DepthImage|undefined>(undefined);
    const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama|undefined>(undefined);

    const loadDataCallback : DepthMapCallback = ([depthMap, depthImage]) => {
        setDepthMap(depthMap);
        setPlanesData(depthMap.geometry);
        setDepthImage(depthImage);
    };

    useEffect(() => {
        try {
            StreetViewUtility.fetchStreetViewImage(LATITUDE, LONGITUDE, loadDataCallback);
        } catch (error) {
            // show error message
            console.log(error);
        }
        setPanorama(new google.maps.StreetViewPanorama(document.getElementById('panorama') as Element));
    }, []);

    useEffect(() => {
        if (panorama) {
            const streetViewService = new google.maps.StreetViewService();
            streetViewService.getPanorama({
                    location: new google.maps.LatLng(LATITUDE, LONGITUDE),
                    radius: 500,
                },
                (data: google.maps.StreetViewPanoramaData|null, status: google.maps.StreetViewStatus) => {
                    if (status === google.maps.StreetViewStatus.OK) {
                        panorama.setPano(data!.location!.pano!);
                        panorama.setVisible(true);
                    }
                },
            );
        }
    }, [panorama]);

    const drawDepthImage = true;
    const drawDepthMap = true;

    return (
        <div className="App">
            <header className="App-header">
                <label>Latitude: {LATITUDE}</label>
                <label>Longitude: {LONGITUDE}</label>
                <br/>
                {<DepthMapDataDisplay depthMapData={depthMap} />}
                <br/>
                {drawDepthMap && <DepthPlanesCanvas planesData={planesData} />}
                {drawDepthImage && <DepthImageCanvas width={512} height={256} depthImage={depthImage} />}
                <div id='panorama' style={{ width: 512, height: 512 }} />
            </header>
        </div>
    );
};

export default StreetViewReconstructionApp;
