import React, { useState, useEffect } from 'react';
import './DepthMapVisualization.css';
import StreetViewUtility, { StreetViewResponse, StreetViewDepthMap, DepthMapCallback, DepthImage } from './utils/StreetViewUtility';

const LOCATION_STRING = '37.7769799,-122.3949447';
const LATITUDE: number = parseFloat(LOCATION_STRING.split(',')[0]);
const LONGITUDE: number = parseFloat(LOCATION_STRING.split(',')[1]);

const DEPTH_IMAGE_VIZ_FACTOR : number = 2.5;
const PLANE_INDEX_VIZ_COLORS : {[key: number] : number[]} = {
    0: [255, 255, 255],
    1: [255, 0, 0],
    2: [0, 255, 0],
    3: [0, 0, 255],
    4: [255, 255, 0],
    5: [255, 0, 255],
    6: [0, 255, 255],
};

const App : React.FC<{}> = () => {

    const [depthMap, setDepthMap] = useState<StreetViewDepthMap | undefined>(undefined);
    const [depthImage, setDepthImage] = useState<DepthImage|undefined>(undefined);

    const loadDataCallback : DepthMapCallback = ([depthMap, depthImage]) => {
        setDepthMap(depthMap);
        setDepthImage(depthImage);
    };

    const loadStreetViewData = (): void => {
        try {
            StreetViewUtility.fetchStreetViewImage(LATITUDE, LONGITUDE)
                .then((response : StreetViewResponse) => {
                    StreetViewUtility.parseDepthMapString(response.model.depth_map, loadDataCallback);
                });
        } catch (error) {
            // show error message
            console.log(error);
        }
    };
    useEffect(loadStreetViewData, []);

    const drawDepthImage = false;
    useEffect(() => {
        const canvas = document.getElementById('depth-map') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx : CanvasRenderingContext2D|null = canvas!.getContext('2d');
        ctx?.clearRect(0, 0, 512, 256);
        
        if (depthImage && drawDepthImage) {
            let maxDistance : number = 0.0;
            const width : number = depthImage[0].length;
            const height : number = depthImage.length;
            const imageData : ImageData = ctx!.createImageData(width, height);
            for (let h = 0; h < height; ++h) {
                for (let w = 0; w < width; ++w) {
                    const index = h * width + w;
                    const grayScale = depthImage[h][w] * DEPTH_IMAGE_VIZ_FACTOR;
                    imageData.data[index * 4] = grayScale;
                    imageData.data[index * 4 + 1] = grayScale;
                    imageData.data[index * 4 + 2] = grayScale;
                    imageData.data[index * 4 + 3] = 255.0;
                    maxDistance = Math.max(depthImage[h][w], maxDistance);
                }
            }
            console.log('Maximum distance: ', maxDistance);
            ctx?.putImageData(imageData, 0, 0);
        } else if (depthMap) {
            const indices = depthMap.geometry.planeIndices;
            const imageData : ImageData = ctx!.createImageData(depthMap.geometry.width, depthMap.geometry.height);
            for (let h = 0; h < indices.length; ++h) {
                for (let w = 0; w < indices[0].length; ++w) {
                    const index = h * indices[0].length + w;
                    const color = PLANE_INDEX_VIZ_COLORS[indices[h][w]];
                    if (color) {
                        imageData.data[index * 4] = color[0];
                        imageData.data[index * 4 + 1] = color[1];
                        imageData.data[index * 4 + 2] = color[2];
                    }
                    imageData.data[index * 4 + 3] = 255.0;
                }
            }
            ctx?.putImageData(imageData, 0, 0);
        }
    }, [depthImage, depthMap, drawDepthImage]);

    const depthMapData: JSX.Element|undefined = depthMap && (
        <table>
            <tbody>
                <tr>
                    <td>Number of Planes</td>
                    <td>{depthMap.metaData.numberOfPlanes}</td>
                </tr>
            </tbody>
        </table>
    );

    return (
        <div className="App">
            <header className="App-header">
                <label>Latitude: {LATITUDE}</label>
                <label>Longitude: {LONGITUDE}</label>
                <br/>
                {depthMapData}
                <br/>
                <canvas id='depth-map' width={512} height={256}/>
            </header>
        </div>
    );
};

export default App;
