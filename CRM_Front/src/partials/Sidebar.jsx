// src/partials/Sidebar.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SidebarLinkGroup from "./SidebarLinkGroup";

/* =======================
   Bigger, Meaningful Icons
   (20x20, consistent sizing)
======================= */
const IconWrap = ({ children }) => (
  <span className="mr-2 flex items-center justify-center w-5 h-5">{children}</span>
);

const DashboardIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M11 2a10 10 0 1 0 10 10 1 1 0 0 0-2 0 8 8 0 1 1-8-8 1 1 0 0 0 0-2Zm1 10a2 2 0 1 1-2-2l-4.3-4.3a1 1 0 0 1 1.4-1.4L11.4 8A2 2 0 0 1 12 12Z" />
  </svg>
));

const OrganizationIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M3 20a1 1 0 0 1-1-1v-3a3 3 0 0 1 3-3h5v-2H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H8v2h5a3 3 0 0 1 3 3v3a1 1 0 0 1-1 1ZM6 8h4V6H6Zm11 12a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1Z" />
  </svg>
));
//Test
const DocumentationIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M6 3h9l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 3h-2V4h1Z" />
    <path d="M7 8h10v2H7Zm0 4h10v2H7Z" />
  </svg>
));

const AuthenticationIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2 3 6v5c0 5 3.6 9.7 9 11 5.4-1.3 9-6 9-11V6l-9-4Zm0 17a1 1 0 0 1-1-1v-3H9a1 1 0 0 1 0-2h2V8a1 1 0 0 1 2 0v5h2a1 1 0 0 1 0 2h-2v3a1 1 0 0 1-1 1Z" />
  </svg>
));

/* New meaningful icons */
const EmployeesIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M7 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm10 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M2 20a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1H2Zm10 0a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1h-10Z" />
  </svg>
));

const RatesIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="m19 5-4 4a2 2 0 1 0 2 2l4-4a2 2 0 1 0-2-2ZM7 15l-4 4 2 2 4-4a2 2 0 1 0-2-2Z" />
    <path d="M7 7h4v2H7zm6 10h4v2h-4z" />
  </svg>
));

const ChatIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" />
  </svg>
));

const OrdersIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
));

const ProductsIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
  </svg>
));

const CategoriesIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
));

const BrandsIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
));

const TagsIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
  </svg>
));

const DepartmentsIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
  </svg>
));

const InventoryIcon = React.memo(() => (
  <svg className="shrink-0 fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
  </svg>
));

const ICONS = {
  dashboard: <DashboardIcon />,
  org: <OrganizationIcon />,
  doc: <DocumentationIcon />,
  auth: <AuthenticationIcon />,
  employees: <EmployeesIcon />,
  rates: <RatesIcon />,
  chat: <ChatIcon />,
  orders: <OrdersIcon />,
  products: <ProductsIcon />,
  categories: <CategoriesIcon />,
  brands: <BrandsIcon />,
  tags: <TagsIcon />,
  departments: <DepartmentsIcon />,
  inventory: <InventoryIcon />,
};

function Sidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const { authData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const hasPrivilege = useCallback(
    (required) => authData?.privilege_ids?.some((id) => required.includes(id)) || false,
    [authData]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }, [navigate]);

  const handleSidebarToggle = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen, setSidebarOpen]);

  // Click outside to close
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // ESC to close
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Persist expand state
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    document.body.classList.toggle("sidebar-expanded", sidebarExpanded);
  }, [sidebarExpanded]);

  /* =========================================================
     MENU: Only requested sections/groups + 2 new ones
     - Dashboard (under Control Panel)
     - Organization Details (under Control Panel)
     - Help (HELP group)
     - Application Setting (Admin Panel)
     - Manage Employees (Add Employees)
     - Chat Service (Customers Chat)
  ========================================================= */
  const menu = useMemo(
    () => [
      // ===== Control Panel =====
      {
        header: "Control Panel",
        items: [
          {
            type: "group",
            label: "Dashboard",
            icon: <IconWrap>{ICONS.dashboard}</IconWrap>,
            show: hasPrivilege([5000, 1]),
            activeMatch: (p) => p === "/" || p.includes("view_top_sum"),
            children: [{ to: "/view_top_sum", label: "Main", show: hasPrivilege([5000, 1]) }],
          },
          {
            type: "group",
            label: "Organization Details",
            icon: <IconWrap>{ICONS.org}</IconWrap>,
            show: hasPrivilege([5000]),
            activeMatch: (p) =>
              p.includes("mainlocations") ||
              p.includes("Locations") ||
              p.includes("section") ||
              p.includes("shifts") ||
              p.includes("subsection") ||
              p.includes("organization_details"),
            children: [
              { to: "/organization_details", label: "Organization Details", show: hasPrivilege([5000]) },
              { to: "/shifts", label: "Work Shifts", show: hasPrivilege([5000]) },
              { to: "/mainlocations", label: "Main Location", show: hasPrivilege([5000]) },
              { to: "/Locations", label: "Locations", show: hasPrivilege([5000]) },
              { to: "/section", label: "Sections", show: hasPrivilege([5000]) },
              { to: "/subsection", label: "Sub Section", show: hasPrivilege([5000]) },
            ],
          },
        ],
      },

      // ===== Help =====
      {
        header: "Help",
        items: [
          {
            type: "group",
            label: "HELP",
            icon: <IconWrap>{ICONS.auth}</IconWrap>,
            show: hasPrivilege([1001001, 5000, 1]),
            children: [
              { to: "/doc_read", label: "Read Doc", icon: ICONS.doc, show: hasPrivilege([5000, 1]) },
              { to: "/doc_center", label: "Manage Docs", icon: ICONS.doc, show: hasPrivilege([5000]) },
            ],
          },
        ],
      },

      // ===== Application Setting =====
      {
        header: "Application Setting",
        items: [
          {
            type: "group",
            label: "Admin Panel",
            icon: <IconWrap>{ICONS.auth}</IconWrap>,
            show: hasPrivilege([1001001, 5000, 1]),
            activeMatch: (p) =>
              p.includes("orgs") ||
              p.includes("users") ||
              p.includes("resetpassword") ||
              p.includes("roles") ||
              p.includes("priv") ||
              p.includes("employee_mode") ||
              p.includes("email_reports"),
            children: [
              { to: "/orgs", label: "Organisations", show: hasPrivilege([1001001]) },
              { to: "/users", label: "Users Management", show: hasPrivilege([5000]) },
              { to: "/resetpassword", label: "Reset Password", show: hasPrivilege([5000, 1]) },
              { to: "/roles", label: "Roles", show: hasPrivilege([5000]) },
              { to: "/priv", label: "Privileges", show: hasPrivilege([1001001, 5000]) },
              { to: "/employee_mode", label: "Employee Mode", show: hasPrivilege([5000]) },
              { to: "/apk_management", label: "APK Management", show: hasPrivilege([5000]) },
              { to: "/email_reports", label: "Email Reports", show: hasPrivilege([5000, 1]) },
              { action: "logout", label: "Logout", show: hasPrivilege([5000, 1]) },
            ],
          },

          /* ===== NEW GROUP: Manage Employees =====
             Children:
              - Employees  (route: /employees)
          */
          {
            type: "group",
            label: "Manage Employees",
            icon: <IconWrap>{ICONS.employees}</IconWrap>,
            show: hasPrivilege([5000]),
            activeMatch: (p) => p.includes("employees"),
            children: [
              { to: "/employees", label: "Employees", show: hasPrivilege([5000]) },
              // Add more employee-related items here
            ],
          },

          /* ===== Chat Service =====
             Children:
              - Customers Chat (route: /chat_customers)
          */
          {
            type: "group",
            label: "Chat Service",
            icon: <IconWrap>{ICONS.chat}</IconWrap>,
            show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]),
            activeMatch: (p) => p.includes("chat_customers"),
            children: [
              { to: "/chat_customers", label: "Customers Chat", icon: ICONS.chat, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
            ],
          },

          /* ===== Customers Management =====
             Children:
              - Customers Management (route: /customers_management)
          */
          {
            type: "group",
            label: "Customers Management",
            icon: <IconWrap>{ICONS.employees}</IconWrap>,
            show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]),
            activeMatch: (p) => p.includes("customers_management"),
            children: [
              { to: "/customers_management", label: "Manage Customers", icon: ICONS.employees, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
            ],
          },

          /* ===== Order Management =====
             Children:
              - Customer Orders (route: /customer_orders)
              - Make Order (route: /make_order)
          */
          {
            type: "group",
            label: "Order Management",
            icon: <IconWrap>{ICONS.orders}</IconWrap>,
            show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]),
            activeMatch: (p) => p.includes("customer_orders") || p.includes("make_order"),
            children: [
              { to: "/customer_orders", label: "Customer Orders", icon: ICONS.orders, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
              { to: "/make_order", label: "Make Orders", icon: ICONS.orders, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
            ],
          },

          /* ===== Products Management =====
             Children:
              - Manage Products (route: /products_management)
              - Manage Categories (route: /categories_management)
              - Manage Brands (route: /brands_management)
              - Manage Tags (route: /tags_management)
              - Make Department (route: /departments_management)
          */
          {
            type: "group",
            label: "Products Management",
            icon: <IconWrap>{ICONS.products}</IconWrap>,
            show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]),
            activeMatch: (p) => p.includes("products_management") || p.includes("categories_management") || p.includes("brands_management") || p.includes("tags_management") || p.includes("departments_management"),
            children: [
              { to: "/products_management", label: "Manage Products", icon: ICONS.products, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
              { to: "/categories_management", label: "Manage Categories", icon: ICONS.categories, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
              { to: "/brands_management", label: "Manage Brands", icon: ICONS.brands, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
              { to: "/tags_management", label: "Manage Tags", icon: ICONS.tags, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
              { to: "/departments_management", label: "Make Department", icon: ICONS.departments, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
            ],
          },

          /* ===== Inventory Management =====
             Children:
              - Inventory Management (route: /inventory_management)
          */
          {
            type: "group",
            label: "Inventory Management",
            icon: <IconWrap>{ICONS.inventory}</IconWrap>,
            show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]),
            activeMatch: (p) => p.includes("inventory_management"),
            children: [
              { to: "/inventory_management", label: "Manage Inventory", icon: ICONS.inventory, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
            ],
          },

          /* ===== Order Taker =====
             Children:
              - Order Taker (route: /order_taker) - Shows orders filtered by user's branch
          */
          {
            type: "group",
            label: "Order Taker",
            icon: <IconWrap>{ICONS.orders}</IconWrap>,
            show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]),
            activeMatch: (p) => p.includes("order_taker"),
            children: [
              { to: "/order_taker", label: "My Orders", icon: ICONS.orders, show: hasPrivilege([5000, 1, 2001, 1001, 1002, 1003, 1004]) },
            ],
          },
        ],
      },
    ],
    [hasPrivilege]
  );

  // ===== Render helpers =====
  const renderLink = (item) => {
    if (item.action === "logout") {
      return (
        <li key="logout" className="mb-1 last:mb-0">
          <button
            onClick={handleLogout}
            className="block w-full text-left text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition duration-150 truncate"
          >
            <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              {item.label}
            </span>
          </button>
        </li>
      );
    }

    return (
      <li key={item.to} className="mb-1 last:mb-0">
        <NavLink
          end
          to={item.to}
          className={({ isActive }) =>
            "block transition duration-150 truncate flex items-center " +
            (isActive ? "text-violet-500" : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
          }
        >
          {item.icon ? <span className="mr-2">{item.icon}</span> : null}
          <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            {item.label}
          </span>
        </NavLink>
      </li>
    );
  };

  const renderGroup = (group) => {
    const active = typeof group.activeMatch === "function" ? group.activeMatch(pathname) : false;

    return (
      <SidebarLinkGroup key={group.label} activecondition={active}>
        {(handleClick, open) => (
          <>
            <a
              href="#0"
              className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                active ? "" : "hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleClick();
                setSidebarExpanded(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {group.icon}
                  <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    {group.label}
                  </span>
                </div>
                <div className="flex shrink-0 ml-2">
                  <svg
                    className={`w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500 ${open && "rotate-180"}`}
                    viewBox="0 0 12 12"
                  >
                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                  </svg>
                </div>
              </div>
            </a>

            {group.children?.length ? (
              <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                  {group.children.filter((c) => c.show).map((c) => renderLink(c))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </SidebarLinkGroup>
    );
  };

  const sidebarClasses = useMemo(
    () =>
      [
        "flex",
        "flex-col",
        "absolute",
        "z-40",
        "left-0",
        "top-0",
        "lg:static",
        "lg:left-auto",
        "lg:top-auto",
        "lg:translate-x-0",
        "h-[100dvh]",
        "overflow-y-scroll",
        "lg:overflow-y-auto",
        "no-scrollbar",
        "w-64",
        "lg:w-20",
        "lg:sidebar-expanded:!w-64",
        "2xl:w-64",
        "shrink-0",
        "bg-white",
        "dark:bg-gray-800",
        "p-4",
        "transition-all",
        "duration-200",
        "ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-64",
        variant === "v2" ? "border-r border-gray-200 dark:border-gray-700/60" : "rounded-r-2xl shadow-xs",
      ].join(" "),
    [sidebarOpen, variant]
  );

  return (
    <div className="min-w-fit">
      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div id="sidebar" ref={sidebar} className={sidebarClasses}>
        {/* Header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={handleSidebarToggle}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>

          <NavLink end to="/" className="block w-32 h-32">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {menu.map((section, idx) => {
            const visibleItems = section.items.filter((it) => it.show);
            if (!visibleItems.length) return null;

            return (
              <div key={section.header + idx}>
                <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
                  <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
                    •••
                  </span>
                  <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">{section.header}</span>
                </h3>

                <ul className="mt-3">
                  {visibleItems.map((item) =>
                    item.type === "group" ? renderGroup(item) : renderLink(item)
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Expand / collapse */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Sidebar);
