import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const tabs = [
  { path: '/', icon: '\u{1F3A4}', label: '首页' },
  { path: '/calendar', icon: '\u{1F4C5}', label: '日历' },
  { path: '/history', icon: '\u{1F4CB}', label: '历史' },
  { path: '/settings', icon: '\u{2699}\u{FE0F}', label: '设置' },
];

export default function Layout() {
  return (
    <div className="layout">
      <main className="layoutContent">
        <Outlet />
      </main>
      <nav className="bottomNav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `navItem${isActive ? ' active' : ''}`
            }
          >
            <span className="navIcon">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
