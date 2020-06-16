
import React, { useEffect } from 'react';

import './depthImageCanvas.css';

const DEPTH_IMAGE_VIZ_FACTOR : number = 2.5;

export interface DepthImageCanvasProps {
    width: number,
    height: number,
    depthImage: number[][]|undefined,
};

const DepthImageCanvas = ({
    width,
    height,
    depthImage,
} : DepthImageCanvasProps) => {

    useEffect(() => {
        const depthImageCanvas = document.getElementById('depth-image') as HTMLCanvasElement;
        if (depthImage && depthImageCanvas) {
            const ctx : CanvasRenderingContext2D|null = depthImageCanvas!.getContext('2d');
            ctx?.clearRect(0, 0, width, height);
    
            let maxDistance : number = 0.0;
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
            // console.log('Maximum distance: ', maxDistance);
            ctx?.putImageData(imageData, 0, 0);
        }
    }, [depthImage, width, height]);
    
    return <canvas id='depth-image' className='depth-image-canvas' width={width} height={height} />
};

export default DepthImageCanvas;
