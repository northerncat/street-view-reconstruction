import React, { useState, useEffect } from 'react';

import './streetViewPanorama.css';

export interface StreetViewPanoramaProps {
    location: google.maps.LatLng,
    updateLocation: (latitude: number, longitude: number) => void,
};

const StreetViewPanorama = ({
    location,
    updateLocation,
} : StreetViewPanoramaProps) => {
    
    const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama|undefined>(undefined);

    useEffect(() => {
        const svPano = new google.maps.StreetViewPanorama(document.getElementById('panorama') as Element);
        svPano.addListener('position_changed', function() {
            const newLocation = svPano.getPosition();
            updateLocation(newLocation.lat(), newLocation.lng());
        });
        setPanorama(svPano);
    }, []);

    useEffect(() => {
        if (panorama) {
            const streetViewService = new google.maps.StreetViewService();
            streetViewService.getPanorama({
                    location: location,
                    radius: 50,
                },
                (data: google.maps.StreetViewPanoramaData|null, status: google.maps.StreetViewStatus) => {
                    if (status === google.maps.StreetViewStatus.OK) {
                        panorama.setPano(data!.location!.pano!);
                        panorama.setVisible(true);
                    }
                },
            );
        }
    }, [panorama, location]);

    return <div id='panorama' style={{ width: 512, height: 512 }} />;
};

export default StreetViewPanorama;
