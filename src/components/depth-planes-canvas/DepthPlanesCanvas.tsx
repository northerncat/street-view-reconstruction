import React, { useEffect } from 'react';

import { StreetViewGeometry } from '../../utils/StreetViewUtility';

import './depthPlanesCanvas.css';

const PLANE_INDEX_VIZ_COLORS : {[key: number] : number[]} = {
    0: [255, 255, 255],
    1: [255, 0, 0],
    2: [0, 255, 0],
    3: [0, 0, 255],
    4: [255, 255, 0],
    5: [255, 0, 255],
    6: [0, 255, 255],
};

export interface DepthPlanesCanvasProps {
    planesData: StreetViewGeometry|undefined,
};

const DepthPlanesCanvas = (props : DepthPlanesCanvasProps) => {
    
    const { planesData } = props;

    useEffect(() => {
        const depthMapCanvas = document.getElementById('depth-planes') as HTMLCanvasElement;
        if (depthMapCanvas && planesData) {
            const ctx : CanvasRenderingContext2D|null = depthMapCanvas!.getContext('2d');
            ctx?.clearRect(0, 0, 512, 256);

            const indices = planesData.planeIndices;
            const imageData : ImageData = ctx!.createImageData(planesData.width, planesData.height);
            for (let h = 0; h < planesData.height; ++h) {
                for (let w = 0; w < planesData.width; ++w) {
                    const index = h * planesData.width + w;
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
    }, [planesData]);

    return <canvas id='depth-planes' width={planesData?.width || 512} height={planesData?.height || 256} />;
};

export default DepthPlanesCanvas;
