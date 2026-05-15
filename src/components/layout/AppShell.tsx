import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { View } from '../../types';

// Placeholders for components not yet defined in the codebase
const OfflineBanner = () => null;
const CommandPalette = ({ setActiveView }: { setActiveView: (v: View) => void }) => null;
const ToastContainer = () => null;

interface AppShellProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isOnline?: boolean;
  children: React.ReactNode;
}

export default function AppShell({
  activeView,
  setActiveView,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isOnline = true,
  children
}: AppShellProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: '#010102',
      }}
    >
      {/* ── SIDEBAR — desktop only ── */}
      <aside
        style={{
          flexShrink: 0,
          width: isSidebarCollapsed ? '72px' : '240px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 300ms ease',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'none',           
        }}
        className="lg:!flex lg:flex-col"
      >
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(p => !p)}
        />
      </aside>

      {/* ── MAIN COLUMN ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Offline Banner */}
        {!isOnline && <OfflineBanner />}

        {/* Header */}
        <header
          style={{
            flexShrink: 0,
            height: '56px',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(1,1,2,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 40,
          }}
        >
          <Header
            activeView={activeView}
            onMenuToggle={() => setIsSidebarCollapsed(p => !p)}
          />
        </header>

        {/* Scrollable Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
          className="
            px-4 pt-4 pb-[calc(72px+env(safe-area-inset-bottom,0px))]
            lg:px-8 lg:pt-6 lg:pb-8
          "
        >
          <div key={activeView}>
            {children}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV — mobile only ── */}
      <div className="lg:hidden">
        <MobileNav activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* ── GLOBALS ── */}
      <CommandPalette setActiveView={setActiveView} />
      <ToastContainer />
    </div>
  );
}
