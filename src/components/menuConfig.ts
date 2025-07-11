import { MdSpaceDashboard, MdSettings, MdSdStorage, MdInsights } from "react-icons/md";
import { FaUserClock, FaTasks, FaCalendarAlt, FaBullhorn, FaComments, FaMoneyBillWave, FaClock, FaProjectDiagram } from "react-icons/fa";

export const menu = [
  { name: "home", path: "/app", icon: MdSpaceDashboard },
  { name: "users", path: "/app/users", icon: FaUserClock },
  { name: "tasks", path: "/app/tasks", icon: FaTasks },
  { name: "announcements", path: "/app/announcements", icon: FaBullhorn },
  { name: "communication", path: "/app/communication", icon: FaComments },
  { name: "finance", path: "/app/finance", icon: FaMoneyBillWave },
  { name: "time-tracking", path: "/app/time-tracking", icon: FaClock },
  { name: "storage", path: "/app/storage", icon: MdSdStorage },
  { name: "calendar", path: "/app/calendar", icon: FaCalendarAlt },
  { name: "insights", path: "/app/insights", icon: MdInsights },
  { name: "settings", path: "/app/settings", icon: MdSettings },
];