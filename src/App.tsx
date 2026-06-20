import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import FilterBar from './components/layout/FilterBar';
import LiveEventFeed from './components/LiveEventFeed';
import LiveKPIBar from './components/LiveKPIBar';
import LiveDeliveryTracking from './dashboards/LiveDeliveryTracking';
import RiderTracking from './dashboards/RiderTracking';
import SuccessRate from './dashboards/SuccessRate';
import AttemptRate from './dashboards/AttemptRate';
import ExceptionDashboard from './dashboards/ExceptionDashboard';
import CODCollection from './dashboards/CODCollection';
import PODDashboard from './dashboards/PODDashboard';
import HubDashboard from './dashboards/HubDashboard';
import SLADashboard from './dashboards/SLADashboard';
import RoutePerformance from './dashboards/RoutePerformance';
import PerformanceDashboard from './dashboards/PerformanceDashboard';
import SupervisorView from './dashboards/SupervisorView';
import CoachingCenter from './dashboards/CoachingCenter';
import RecognitionHub from './dashboards/RecognitionHub';
import LearningCenter from './dashboards/LearningCenter';
import IncentiveEngine from './dashboards/IncentiveEngine';
import SafetyDashboard from './dashboards/SafetyDashboard';
import AttendanceDashboard from './dashboards/AttendanceDashboard';
import ReturnsDashboard from './dashboards/ReturnsDashboard';
import RiderIntelligenceDashboard from './dashboards/RiderIntelligenceDashboard';
import DataFlowDiagram from './dashboards/DataFlowDiagram';
import { startLiveEngine } from './store/liveDataStore';

function AppLayout() {
  const location = useLocation();
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <Header pathname={location.pathname} />
        <LiveKPIBar show={true} />
        <FilterBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<LiveDeliveryTracking />} />
            <Route path="/riders" element={<RiderTracking />} />
            <Route path="/success-rate" element={<SuccessRate />} />
            <Route path="/attempt-rate" element={<AttemptRate />} />
            <Route path="/exceptions" element={<ExceptionDashboard />} />
            <Route path="/cod" element={<CODCollection />} />
            <Route path="/pod" element={<PODDashboard />} />
            <Route path="/hubs" element={<HubDashboard />} />
            <Route path="/sla" element={<SLADashboard />} />
            <Route path="/routes" element={<RoutePerformance />} />
            <Route path="/performance" element={<PerformanceDashboard />} />
            <Route path="/supervisor" element={<SupervisorView />} />
            <Route path="/coaching"    element={<CoachingCenter />} />
            <Route path="/recognition" element={<RecognitionHub />} />
            <Route path="/learning"    element={<LearningCenter />} />
            <Route path="/incentives"  element={<IncentiveEngine />} />
            <Route path="/safety"      element={<SafetyDashboard />} />
            <Route path="/attendance"  element={<AttendanceDashboard />} />
            <Route path="/returns"    element={<ReturnsDashboard />} />
            <Route path="/rider-intelligence" element={<RiderIntelligenceDashboard />} />
            <Route path="/data-flow"  element={<DataFlowDiagram />} />
          </Routes>
        </div>
      </div>
      <LiveEventFeed />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    startLiveEngine();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
