
import {Routes, Route, Navigate} from 'react-router-dom';
import {ProtectedRoutes} from '../components/auth/ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import SearchPage from '../pages/SearchPage';
import {SeatSelectionPage} from '../pages/SeatSelectionPage';
import {CheckoutPage} from '../pages/CheckoutPage';
import {AdminDashboard} from '../pages/admin/Dashboard';
import {AddBusPage} from '../pages/admin/AddBusPage';
import {AddOperatorPage} from '../pages/admin/AddOperator';
import {OperatorDashboard} from '../pages/operator/OperatorDashboard';
import { EditSeatLayoutPage } from '../pages/operator/EditSeatLayout';
import { MyBusesPage } from '../pages/operator/MyBusesPage';
import { CreateRoutePage } from '../pages/operator/CreateRoutePage';
import { ScheduleTripPage } from '../pages/operator/ScheduleTripPage';
import { BookingManagerPage } from '../pages/operator/BookingManagerPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { MyTripsPage } from '../pages/operator/MyTripsPage';
import { OperatorInbox } from '../pages/operator/OperatorInbox';
import { RouteCreator } from '../pages/operator/RouteCreator';
import { TripTrackingPage } from '../pages/operator/TripTrackingPage';

import { MainLayout } from '../components/layout/MainLayout';

const AppRoutes = () => {
    return(
        
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoutes allowedRoles={['passenger','operator','admin']} />}>
                <Route element={<MainLayout />}>
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/book/:tripId" element={<SeatSelectionPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                </Route>
            </Route>
            <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/add-bus" element={<AddBusPage />} />
                <Route path="/admin/add-operator" element={<AddOperatorPage />} />
            </Route>
            <Route element={<ProtectedRoutes allowedRoles={['operator']} />}>
                <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                <Route path="/operator/buses" element={<MyBusesPage />} />
                <Route path="/operator/bus/:bus_id/seats" element={<EditSeatLayoutPage />} />
                <Route path="/operator/create-route" element={<CreateRoutePage />} />
                <Route path="/operator/schedule-trip" element={<ScheduleTripPage />} />
                <Route path="/operator/booking-manager" element={<BookingManagerPage />} />
                <Route path="/operator/trips" element={<MyTripsPage />}/>
                <Route path="/operator/inbox" element={<OperatorInbox />}/>
                <Route path="/operator/route-creator" element={<RouteCreator />}/>
                <Route path="/operator/track/:tripId" element={<TripTrackingPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        
    )
};

export default AppRoutes;