import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { TransferProvider } from './context/TransferContext.jsx';
import { Layout } from './components/Layout/Layout.jsx';

import { Home } from './pages/Home.jsx';
import { SendPage } from './pages/SendPage.jsx';
import { ReceivePage } from './pages/ReceivePage.jsx';
import { TransfersPage } from './pages/TransfersPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.jsx';

export default function App() {
  return (
    <SettingsProvider>
      <SocketProvider>
        <TransferProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/send" element={<SendPage />} />
                <Route path="/receive" element={<ReceivePage />} />
                <Route path="/transfers" element={<TransfersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
              </Routes>
            </Layout>
          </Router>
        </TransferProvider>
      </SocketProvider>
    </SettingsProvider>
  );
}
