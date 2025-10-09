import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

const menuItems = [
  { icon: 'fas fa-chart-pie', label: 'Dashboard', path: '/dashboard', badge: null },
  { icon: 'fas fa-comments', label: 'Live Chat', path: '/livechat', badge: null },
  { icon: 'fas fa-robot', label: 'Bot Builder', path: '/botbuilder', badge: null },
  { icon: 'fas fa-chart-bar', label: 'Analytics', path: '/analytics', badge: null },
  { icon: 'fas fa-plug', label: 'Integrations', path: '/integrations', badge: null },
  { icon: 'fas fa-users', label: 'Customers', path: '/customers', badge: null },
  { icon: 'fas fa-cog', label: 'Settings', path: '/settings', badge: null },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // ...existing code for SidebarItem, handleSignOut, and UI...

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Sidebar UI would be implemented here */}
    </div>
  )
}
