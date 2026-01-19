import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SocketService } from '../../services/SocketService';

// --- Assets ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Fix Leaflet Icons ---
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Types ---
interface BusLocation {
    trip_id: string | number;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
}

interface BusMapProps {
    tripId: number | string; // Accept both to be safe
}

// --- Helper: Smooth Map Recenter ---
const MapRecenter = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.5 });
    }, [lat, lng, map]);
    return null;
};

const BusMap: React.FC<BusMapProps> = ({ tripId }) => {
    const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('Never');
    const socketRef = useRef<any>(null);

    useEffect(() => {
        // 1. Get Socket
        const socket = SocketService.getSocket();
        if (!socket) {
            console.error("❌ Socket Service failed to return a socket.");
            return;
        }
        socketRef.current = socket;

        // 2. Define Room ID (Force String)
        const roomID = String(tripId);

        // 3. Setup Listeners
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        
        const onLocationUpdate = (data: BusLocation) => {
            console.log("📍 LIVE UPDATE RECEIVED:", data);
            setBusLocation(data);
            setLastUpdated(new Date().toLocaleTimeString());
        };

        // 4. Bind Events
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('receive_location', onLocationUpdate);

        // 5. Join Room immediately
        // If socket is already connected, emit now. If not, 'connect' listener will handle it? 
        // Better to just emit. If disconnected, it buffers.
        console.log(`🔵 Joining Room: ${roomID}`);
        socket.emit('join_tracking', roomID); 
        
        // Check initial status
        if (socket.connected) setIsConnected(true);

        // Cleanup
        return () => {
            console.log(`🔴 Leaving Room: ${roomID}`);
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('receive_location', onLocationUpdate);
            socket.emit('leave_tracking', roomID); // Good practice to leave rooms
        };
    }, [tripId]);

    // --- Loading State ---
    if (!busLocation) {
        return (
            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', borderRadius: '12px', border: '1px dashed #ccc' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e0e0e0', borderTop: '4px solid #1976d2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '15px', color: '#666', fontWeight: 500 }}>Waiting for GPS signal...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '450px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            {/* --- INDUSTRIAL STATUS OVERLAY --- */}
            <div style={{
                position: 'absolute', top: 10, right: 10, zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '6px 12px', borderRadius: '20px',
                display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '12px', fontWeight: 'bold'
            }}>
                <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: isConnected ? '#4caf50' : '#f44336',
                    boxShadow: isConnected ? '0 0 8px #4caf50' : 'none'
                }}></div>
                <span style={{ color: '#333' }}>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            <div style={{
                position: 'absolute', bottom: 20, left: 10, zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#fff', padding: '4px 10px', borderRadius: '4px',
                fontSize: '10px', fontFamily: 'monospace'
            }}>
                Last Update: {lastUpdated} | Speed: {Math.round(busLocation.speed || 0)} km/h
            </div>
            {/* ---------------------------------- */}

            <MapContainer 
                center={[busLocation.latitude, busLocation.longitude]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <Marker position={[busLocation.latitude, busLocation.longitude]}>
                    <Popup>
                        <strong>Bus #{tripId}</strong>
                    </Popup>
                </Marker>

                <MapRecenter lat={busLocation.latitude} lng={busLocation.longitude} />
            </MapContainer>
        </div>
    );
};

export default BusMap;