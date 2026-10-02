import React from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { MobileNav } from './MobileNav.jsx';
import { IncomingRequestModal } from '../Receive/IncomingRequestModal.jsx';
import { RejectionToast } from '../Send/RejectionToast.jsx';
import { StoragePermissionModal } from '../Common/StoragePermissionModal.jsx';

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#FAF7F0] text-black antialiased font-sans font-medium">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Storage & Gallery Access Permission Modal */}
      <StoragePermissionModal />

      {/* Global Incoming Transfer Approval Modal */}
      <IncomingRequestModal />

      {/* Global Rejection Toast for Sender */}
      <RejectionToast />
    </div>
  );
}
