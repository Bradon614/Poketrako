import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';
import BottomTabBar from './BottomTabBar';
import './AppShell.css';

/**
 * AppShell — the frame every authenticated page lives in.
 *
 *   desktop : frosted rail on the left, content column on the right
 *   phones  : content only, with a floating glass tab bar at the bottom
 *
 * It owns the page transition (content is re-keyed on route change so the
 * entrance animation replays) and scroll restoration, so a navigation never
 * lands the user halfway down the previous page.
 */

const AppShell = () => {
  const { pathname } = useLocation();
  const scrollerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="app-shell">
      <SidebarNav />

      <div className="app-body">
        <TopBar />
        <main className="app-content" id="main" ref={scrollerRef} tabIndex={-1}>
          <div className="page" key={pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default AppShell;
