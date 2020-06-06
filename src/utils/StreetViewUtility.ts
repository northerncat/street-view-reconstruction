import { inflate } from 'zlib';

export interface Point {
    x: number,
    y: number,
    z: number,
};

export interface StreetViewPointCloud {
    width: number,
    height: number,
    points: Point[][],
};

export type DepthImage = Array<Array<number>>;

export interface Vector {
    x: number,
    y: number,
    z: number,
};

function dot(v1: Vector, v2: Vector) : number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

export interface Plane {
    n: Vector,
    d: number,
};

export interface DepthMapMetaData {
    metaDataSize: number,
    numberOfPlanes: number,
    width: number,
    height: number,
    offset: number,
};

export interface StreetViewGeometry {
    width: number,
    height: number,
    planeIndices: number[][],
    planes: Plane[],
};

export interface StreetViewDepthMap {
    metaData: DepthMapMetaData,
    bufferData: DataView,
    geometry: StreetViewGeometry,
};

export interface StreetViewResponse {
    model: {
        depth_map: string,
    },
};

export type DepthMapCallback = ([depthMap, depthImage]: [StreetViewDepthMap, DepthImage]) => void;

function toDataView(buf: Buffer) : DataView {
    const array = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; ++i) {
        array[i] = buf[i];
    }
    return new DataView(array.buffer);
};

function create2DArray<T>(width: number, height: number) : T[][] {
    const array : T[][] = new Array<Array<T>>(height);
    for (let h = 0; h < height; h++) {
        array[h] = new Array<T>(width);
    }
    return array;
};

function getStreetViewDepthDataUrl(options : {[key: string] : any}) : string {
    const queryString : string = Object.keys(options)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(options[key]))
        .join('&');
    return 'https://maps.google.com/cbk?' + queryString;
}

export default class StreetViewUtility {

    static fetchStreetViewImage(lat: number = 0.0, long: number = 0.0) : Promise<StreetViewResponse> {
        const url = getStreetViewDepthDataUrl({ output: 'json', ll: `${lat},${long}`, dm: 1 });
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            });
    }

    static parseDepthMapString(rawDepthMapData: string, callback: DepthMapCallback) : void {
        
        while (rawDepthMapData.length % 4 !== 0) {
            rawDepthMapData += '=';
        }
        rawDepthMapData = rawDepthMapData.replace(/-/g, '+');
        rawDepthMapData = rawDepthMapData.replace(/_/g, '/');

        inflate(Buffer.from(rawDepthMapData, 'base64'), (error: Error | null, result: Buffer) => {
            if (error) {
                throw error;
            }
            const dataView : DataView = toDataView(result);
            const metaData : DepthMapMetaData = StreetViewUtility.getDepthMapMetaData(dataView);
            const geometry : StreetViewGeometry = StreetViewUtility.getStreetViewGeometry(metaData, dataView);
            const depthImage : number[][] = StreetViewUtility.getDepthImage(geometry);
            callback([
                {
                    metaData,
                    bufferData: dataView,
                    geometry,
                },
                depthImage
            ]);
        });
    }

    static getDepthMapMetaData(buffer: DataView) : DepthMapMetaData {
        return {
            metaDataSize: buffer.getUint8(0),
            numberOfPlanes: buffer.getUint16(1, true),
            width: buffer.getUint16(3, true),
            height: buffer.getUint16(5, true),
            offset: buffer.getUint16(7, true),
        };
    }

    static getStreetViewGeometry(metaData: DepthMapMetaData, buffer : DataView) : StreetViewGeometry {
        const planes : Plane[] = new Array<Plane>(metaData.numberOfPlanes);
        const planeIndices : number[][] = create2DArray<number>(metaData.width, metaData.height);
        
        // parsing referenced from https://github.com/proog128/GSVPanoDepth.js
        for (let h = 0; h < metaData.height; h++) {
            for (let w = 0; w < metaData.width; w++) {
                planeIndices[h][w] = buffer.getUint8(metaData.offset + w + h * metaData.width);
            }
        }

        const planesStartIndex = metaData.offset + metaData.height * metaData.width;
        for (let p = 0; p < metaData.numberOfPlanes; ++p) {
            // each plane is represented by four 32-bit floats
            const offset : number = planesStartIndex + p * 4 * 4;
            planes[p] = {
                n: {
                    x: buffer.getFloat32(offset, true),
                    y: buffer.getFloat32(offset + 4, true),
                    z: buffer.getFloat32(offset + 8, true),            
                },
                d: buffer.getFloat32(offset + 12, true),
            };
        }
        return { width: metaData.width, height: metaData.height, planes, planeIndices };
    }

    static getDepthImage(geometry: StreetViewGeometry) {
        const depthImage : number[][] = create2DArray(geometry.width, geometry.height);

        // parsing referenced from https://github.com/proog128/GSVPanoDepth.js
        for (let h = 0; h < depthImage.length; h++) {
            const theta : number = (geometry.height - h - 0.5) / geometry.height * Math.PI;
            const sinTheta : number = Math.sin(theta);
            const cosTheta : number = Math.cos(theta);
            for (let w = 0; w < depthImage[0].length; w++) {
                const planeIndex : number = geometry.planeIndices[h][w];
                if (planeIndex > 0) {
                    const phi : number = (geometry.width - w - 0.5) * 2 * Math.PI / geometry.width;
                    const viewDirection : Vector = {
                        x: sinTheta * Math.cos(phi),
                        y: sinTheta * Math.sin(phi),
                        z: cosTheta,
                    };
                    const plane : Plane = geometry.planes[planeIndex];
                    const distance : number = Math.abs(plane.d / (dot(plane.n, viewDirection)));
                    depthImage[h][w] = distance;
                } else {
                    depthImage[h][w] = 0.0;
                }
            }
        }
        return depthImage;
    }

};