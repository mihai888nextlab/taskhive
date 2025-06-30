import { MdSpaceDashboard, MdSettings, MdSdStorage, MdInsights } from "react-icons/md";
import { FaUserClock, FaTasks, FaCalendarAlt, FaBullhorn, FaComments, FaMoneyBillWave, FaClock, FaProjectDiagram } from "react-icons/fa";

export const menu = [
  { name: "Home", path: "/app", icon: MdSpaceDashboard },
  { name: "Users", path: "/app/users", icon: FaUserClock },
  { name: "Tasks", path: "/app/tasks", icon: FaTasks },
  { name: "Announcements", path: "/app/announcements", icon: FaBullhorn },
  { name: "Communication", path: "/app/communication", icon: FaComments },
  { name: "Finance", path: "/app/finance", icon: FaMoneyBillWave },
  { name: "Time Tracking", path: "/app/time-tracking", icon: FaClock },
  { name: "Storage", path: "/app/storage", icon: MdSdStorage },
  { name: "Calendar", path: "/app/calendar", icon: FaCalendarAlt },
  { name: "Insights", path: "/app/insights", icon: MdInsights },
  { name: "Settings", path: "/app/settings", icon: MdSettings },
];