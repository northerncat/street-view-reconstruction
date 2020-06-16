
import React from 'react';

import { StreetViewDepthMap } from '../../utils/StreetViewUtility';

export interface DepthMapDataDisplayProps {
    depthMapData: StreetViewDepthMap|undefined,
};

const DepthMapDataDisplay = ({
    depthMapData
} : DepthMapDataDisplayProps) => {
    if (!depthMapData) {
        return null;
    }

    return (
        <table>
            <tbody>
                <tr>
                    <td>Number of Planes</td>
                    <td>{depthMapData.metaData.numberOfPlanes}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default DepthMapDataDisplay;
