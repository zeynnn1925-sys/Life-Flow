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
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-ink)',
      }}
    >
      {/* ── SIDEBAR — desktop only ── */}
      <aside
        style={{
          flexShrink: 0,
          width: isSidebarCollapsed ? '72px' : '200px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 300ms ease',
          borderRight: '1px solid var(--color-hairline)',
          display: 'none',           
        }}
        className="lg:!flex lg:flex-col animate-fade-in"
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
          backgroundColor: 'var(--color-canvas)',
        }}
      >
        {/* Offline Banner */}
        {!isOnline && <OfflineBanner />}

        {/* Header */}
        <header
          style={{
            flexShrink: 0,
            height: '44px',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-1)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--color-hairline)',
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
            px-3 pt-3 pb-[calc(56px+env(safe-area-inset-bottom,0px)+12px)]
            lg:px-6 lg:pt-5 lg:pb-[20px]
          "
        >
          <div key={activeView} className="max-w-7xl mx-auto w-full">
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
