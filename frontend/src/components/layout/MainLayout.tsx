import React from 'react';
import { Outlet } from 'react-router-dom';
import { AIChatFab } from '../../components/common/AIChatFab';

export const MainLayout = () => {
    return (
        <div className="app-container">
            {/* The <Outlet /> renders the child route (e.g., SearchPage, MyBookings) */}
            <Outlet />
            
            {/* The Global Overlay */}
            <AIChatFab />
        </div>
    );
};