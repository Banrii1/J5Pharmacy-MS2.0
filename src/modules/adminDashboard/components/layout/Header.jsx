import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import headerLogo from '../../assets/headerLogo.png';
import GenericAvatar from '../../assets/GenericAvatar.png';
import DotsMoreDark from '../../assets/dotsMoreDark.png';
import { Drawer, Button, List, ListItem, ListItemText, ListItemIcon, Divider, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Hamburger menu icon
import DashboardIcon from '@mui/icons-material/Dashboard'; // Dashboard icon
import InventoryIcon from '@mui/icons-material/Inventory'; // Inventory icon
import BranchesIcon from '@mui/icons-material/LocationCity'; // Branches icon
import ReportIcon from '@mui/icons-material/BarChart'; // Reports icon
import EmployeeIcon from '@mui/icons-material/People'; // Employee & Staff icon
import CustomerIcon from '@mui/icons-material/Person'; // Customer Info icon
import SettingsIcon from '@mui/icons-material/Settings'; // Settings icon
import NotificationsIcon from '@mui/icons-material/Notifications'; // Notifications icon

// Sample navigation items
const navigationItems = [
  {
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Inventory',
    path: '/admin/inventory',
    icon: <InventoryIcon />,
    children: [
      { title: 'List of Items', path: '/admin/inventory' },
      { title: 'Item', path: '/inventory/item' },
      { title: 'Encode Items', path: '/inventory/encode' },
    ],
  },
  {
    title: 'Branches',
    path: '/admin/branches',
    icon: <BranchesIcon />,
    children: [
      { title: 'Manage Branch', path: '/branches/manage' },
      { title: 'Add a Branch', path: '/branches/add' },
    ],
  },
  {
    title: 'Reports',
    path: '/admin/reports',
    icon: <ReportIcon />,
    children: [
      { title: 'Statistics', path: '/reports/statistics' },
      { title: 'Sales', path: '/reports/sales' },
      { title: 'Inventory', path: '/reports/inventory' },
      { title: 'Returns', path: '/reports/returns' },
      { title: 'Void', path: '/reports/void' },
    ],
  },
  {
    title: 'Employee & Staff',
    path: '/admin/employee-staff',
    icon: <EmployeeIcon />,
    children: [
      { title: 'Manage Staff', path: '/staff/manage' },
      { title: 'Add Staff', path: '/staff/add' },
    ],
  },
  {
    title: 'Customer Info',
    path: '/admin/customer-info',
    icon: <CustomerIcon />,
    children: [
      { title: 'Customer List', path: '/customers/list' },
      { title: 'StarPoints', path: '/customers/starpoints' },
    ],
  },
  {
    title: 'Settings',
    path: '/admin/settings',
    icon: <SettingsIcon />,
  },
  {
    title: 'Notifications',
    path: '/admin/notifications',
    icon: <NotificationsIcon />,
    children: [
      { title: 'Announcements', path: '/notifications/announcements' },
      { title: 'Message Board', path: '/notifications/messages' },
    ],
  },
];

const Header = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [isMobileView, setIsMobileView] = useState(false); // Track mobile view state

  useEffect(() => {
    const updateGreetingAndTime = () => {
      const now = new Date();
      setCurrentTime(formatDate(now));

      const currentHour = now.getHours();
      if (currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const datePart = date.toLocaleDateString('en-US', options);
      const timePart = date.toTimeString().split(' ')[0];
      return `${datePart} ${timePart}`;
    };

    updateGreetingAndTime();
    const intervalId = setInterval(updateGreetingAndTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Event listener to track window resizing
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setIsMobileView(true); // Mobile view
      } else {
        setIsMobileView(false); // Desktop view
      }
    };

    handleResize(); // Check the size initially
    window.addEventListener('resize', handleResize); // Listen for window resizing

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener
    };
  }, []);

  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
  };

  const toggleSubMenu = (menu) => {
    setOpenSubMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <nav className="navbar font-all bg-[#F7FAFD] w-full p-0 border-b-2 border-[#1D242E4D]">
      <div className="container-fluid flex justify-between items-center px-6">
        {/* Logo */}
        <div className="ml-[-26px] bg-white flex items-center justify-center h-[59.7812px] flex-shrink-0" style={{ width: '286px' }}>
          <a className="navbar-brand mb-0" href="#">
            <img src={headerLogo} alt="J5 Pharmacy Logo" className="w-auto h-auto max-w-[162px]" />
          </a>
        </div>

        {/* Search Bar */}
        <form className="flex-grow-1 px-4 pe-2" role="search" style={{ display: isMobileView ? 'none' : 'flex' }}>
          <div className="input-group" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search Medicine here"
              aria-label="Search"
              style={{
                padding: '6px 12px',
                color: 'rgb(33, 37, 41)',
                maxWidth: '440px',
                backgroundColor: '#E3EBF3',
                fontSize: '13px',
                border: 'none',
                marginLeft: '0',
                paddingLeft: '10px',
              }}
            />
            <button
              type="submit"
              className="btn"
              aria-label="Search"
              style={{
                backgroundColor: '#F7FAFD',
                border: '1px solid #A4A5A7',
                marginLeft: '-9px',
                cursor: 'pointer',
                padding: '2.7px 7px',
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Greeting and Time */}
        <div className="text-end hidden lg:flex flex-col pr-5" style={{ display: isMobileView ? 'none' : 'flex' }}>
          <p className="mb-[-1.4px] font-bold text-[14px]">{greeting}</p>
          <small className="text-[12px] pr-2">{currentTime}</small>
        </div>

        {/* Hamburger Menu Button */}
        <Button onClick={() => toggleDrawer(true)} style={{ display: isMobileView ? 'block' : 'none', marginRight: '1rem' }} aria-label="Toggle Navigation">
          <MenuIcon style={{ fontSize: '20px', color: 'black' }} />
        </Button>

        {/* Drawer Navigation */}
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => toggleDrawer(false)} className="w-[400px]">
          <div className="flex flex-col justify-between h-full p-4 w-[350px]">
            <div>
              <p className="font-bold text-[14px]">{greeting}</p>
              <small className="text-[12px]">{currentTime}</small>
            </div>

            {/* Search Bar in Drawer */}
            <form className="flex-grow-1 px-4 pe-2 mb-4" role="search" style={{ display: 'flex' }}>
              <div className="input-group" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search Medicine here"
                  aria-label="Search"
                  style={{
                    padding: '6px 12px',
                    color: 'rgb(33, 37, 41)',
                    maxWidth: '440px',
                    backgroundColor: '#E3EBF3',
                    fontSize: '13px',
                    border: 'none',
                    marginLeft: '0',
                    paddingLeft: '10px',
                  }}
                />
                <button
                  type="submit"
                  className="btn"
                  aria-label="Search"
                  style={{
                    backgroundColor: '#F7FAFD',
                    border: '1px solid #A4A5A7',
                    marginLeft: '-9px',
                    cursor: 'pointer',
                    padding: '2.7px 7px',
                  }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <List>
              {navigationItems.map((item) => (
                <React.Fragment key={item.title}>
                  <ListItem button component={Link} to={item.path}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItem>
                  {item.children && (
                    <Collapse in={openSubMenus[item.title]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItem button key={child.title} component={Link} to={child.path} sx={{ paddingLeft: '32px' }}>
                            <ListItemText primary={child.title} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </List>

            <Divider />

            {/* Profile Section */}
            <footer className="mt-auto px-8 py-6 border-t border-[#ddd]">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img src={GenericAvatar} alt="Profile" className="w-12 h-12 rounded-full" />
                  <div className="ml-4 text-left">
                    <h5 className="font-medium text-[#333] text-[17px]">Janeth</h5>
                    <p className="text-[#555] text-[13px] mt-1">Owner</p>
                  </div>
                </div>
                <div className="text-[#333] text-[20px] cursor-pointer">
                  <img src={DotsMoreDark} alt="More Options" className="w-[3.8px] h-[17px]" />
                </div>
              </div>
            </footer>
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default Header;
