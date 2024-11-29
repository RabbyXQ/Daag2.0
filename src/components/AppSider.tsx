import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBell, FaCartPlus, FaCircleNotch, FaCog, FaDollarSign, FaFacebookMessenger, FaHammer, FaHandsHelping, FaHome, FaMap, FaMapMarked, FaMapMarkedAlt, FaMapMarker, FaMapSigns, FaQuestion, FaRss, FaShopify, FaShoppingBasket, FaStore, FaUser, FaUserCheck, FaUserCog, FaUserFriends, FaWallet, FaBars, FaTimes, FaPlus, FaDivide } from 'react-icons/fa';

const menuItems = [
  { href: '/dashboard', icon: <FaRss className="h-6 w-6" />, name: 'Dashboard' },
  { href: '/profile', icon: <FaUser className="h-6 w-6" />, name: 'Profile' },
  { href: '/connections', icon: <FaUserFriends className="h-6 w-6" />, name: 'Connections' },
  {
    href: '/participators',
    icon: <FaUserCog className="h-6 w-6" />,
    name: 'Participators',
  },
  {
    href: '/land',
    icon: <FaMap className="h-6 w-6" />,
    name: 'Lands',
    submenu: [
      { href: '/land/add', icon: <FaPlus className="h-5 w-5" />, name: 'Add Land' },
      { href: '/land/part', icon: <FaDivide className="h-5 w-5" />, name: 'Partition Land' },

    ],
  },
  { href: '/dashboard/market', icon: <FaStore className="h-6 w-6" />, name: 'Market' },
  { href: '/bids', icon: <FaHammer className="h-6 w-6" />, name: 'Bids' },
  { href: '/messages', icon: <FaFacebookMessenger className="h-6 w-6" />, name: 'Messages' },
  { href: '/notifications', icon: <FaBell className="h-6 w-6" />, name: 'Notifications' },
  { href: '/settings', icon: <FaCog className="h-6 w-6" />, name: 'Settings' },
  { href: '/help', icon: <FaQuestion className="h-6 w-6" />, name: 'Help' },
];

const Sidebar = () => {
  const pathname = usePathname(); // Get the current path
  const [isOpen, setIsOpen] = useState(false); // State for sidebar visibility
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null); // State for submenu visibility

  useEffect(() => {
    // Retrieve the sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    // Save the sidebar state to localStorage
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  return (
    <div className={`fixed top-0 left-0 h-full ${isOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white z-50 flex flex-col transition-width duration-300`}>
      {/* Header */}
      <div className={`flex items-center px-4 transition-all duration-300 ${isOpen ? 'h-16' : 'h-14'}`}>
        {isOpen && (
          <>
            <FaMapMarkedAlt className="text-white w-7 h-7" />
            <h1 className="text-white text-3xl font-bold ml-4">Daag</h1>
          </>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute right-0 w-12 h-12 flex items-center justify-center text-white bg-gray-700 rounded-l-lg"
      >
        {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
      </button>

      {/* Scrollable Icon Container */}
      <div className="flex-1 overflow-y-auto mt-0">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            <div
              className={`relative flex items-center group ${isOpen ? 'w-full' : 'justify-center'} ${pathname === item.href ? 'bg-green-100 text-black' : ''}`}
            >
              {/* Background effect */}
              <div className={`absolute inset-0 transition-transform duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left z-0 ${pathname === item.href ? 'bg-green-500 dark:bg-green-700' : 'bg-gray-700'}`}></div>

              {/* Main icon link */}
              <div className={`relative flex items-center ${isOpen ? 'w-full' : 'w-16'} h-12 z-10`}>
                <Link href={item.href} className="flex items-center w-full h-full px-4" onClick={() => item.submenu && toggleSubmenu(item.name)}>
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  {isOpen && <span className="ml-4 text-md font-medium">{item.name}</span>}
                </Link>
              </div>
            </div>

            {/* Submenu */}
            {isOpen && item.submenu && openSubmenu === item.name && (
              <div className="ml-6">
                {item.submenu.map((subitem, subIndex) => (
                  <Link key={subIndex} href={subitem.href}>
                    <div
                      className={`flex items-center h-10 ${pathname === subitem.href ? 'bg-green-100 text-black' : 'text-white'}`}
                    >
                      <div className="flex items-center justify-center">
                        {subitem.icon}
                      </div>
                      <span className="ml-4">{subitem.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
