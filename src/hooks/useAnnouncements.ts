import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from '@/components/ThemeContext';
import { useTranslations } from "next-intl";
import { saveAs } from "file-saver";

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  category: string;
  pinned: boolean;
  expiresAt?: string;
  eventDate?: string;
}

export function useAnnouncements() {
  const { theme } = useTheme();
  const t = useTranslations("AnnouncementsPage");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Update");
  const [pinned, setPinned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expiresAt, setExpiresAt] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'pinned'>('all');
  const [eventDate, setEventDate] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const categories = ["All", "Update", "Event", "Alert"];

  useEffect(() => {
    fetch("/api/announcements")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(setAnnouncements)
      .catch(err => {
        setFormError("Failed to load announcements: " + err.message);
      })
      .finally(() => setLoading(false));
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user);
      });
  }, []);

  const isAdmin = useMemo(() => currentUser?.role === "admin", [currentUser]);

  const handlePinToggle = useCallback(async (id: string, pinned: boolean) => {
    setLoading(true);
    try {
      await fetch(`/api/announcements/${id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      setAnnouncements(anns =>
        anns.map(a => a._id === id ? { ...a, pinned } : a)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleComment = useCallback((id: string, comment: string) => {
    // Optionally send to backend
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!announcements || announcements.length === 0) {
      alert("No announcements to export.");
      return;
    }
    const rows = [
      ["Title", "Content", "Category", "Pinned", "Created At", "Created By"],
      ...announcements
        .filter(a => a.category !== "All")
        .map(a => [
          a.title,
          (a.content || "").replace(/\n/g, " "),
          a.category,
          a.pinned ? "Yes" : "No",
          new Date(a.createdAt).toLocaleString(),
          a.createdBy
            ? `${a.createdBy.firstName} ${a.createdBy.lastName} (${a.createdBy.email})`
            : "",
        ])
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "announcements.csv");
  }, [announcements]);

  const handleExportPDF = useCallback(() => {
    if (!announcements || announcements.length === 0) {
      alert("No announcements to export.");
      return;
    }
    const jsPDF = require('jspdf').default;
    const autoTableModule = require('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("Announcements Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    const columns = [
      { header: "Title", dataKey: "title" },
      { header: "Content", dataKey: "content" },
      { header: "Category", dataKey: "category" },
      { header: "Pinned", dataKey: "pinned" },
      { header: "Created At", dataKey: "createdAt" },
      { header: "Created By", dataKey: "createdBy" },
    ];
    const rows = announcements
      .filter(a => a.category !== "All")
      .map(a => ({
        title: a.title,
        content: (a.content || "").replace(/\r\n|\r|\n/g, "\n"),
        category: a.category,
        pinned: a.pinned ? "Yes" : "No",
        createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
        createdBy: a.createdBy ? `${a.createdBy.firstName} ${a.createdBy.lastName} (${a.createdBy.email})` : "",
      }));
    autoTable(doc, {
      startY: 38,
      columns,
      body: rows,
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
        halign: 'left',
        valign: 'middle',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 11,
        textColor: 34,
        cellPadding: 2.5,
        halign: 'left',
        valign: 'top',
        lineColor: [220, 220, 220],
        minCellHeight: 8,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      alternateRowStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
      },
      columnStyles: {
        title: { cellWidth: 32 },
        content: { cellWidth: 70 },
        category: { cellWidth: 22 },
        pinned: { cellWidth: 15 },
        createdAt: { cellWidth: 22 },
        createdBy: { cellWidth: 38 },
      },
      margin: { left: 10, right: 10 },
      styles: {
        font: 'helvetica',
        fontSize: 11,
        cellPadding: 2.5,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        minCellHeight: 8,
        textColor: 34,
      },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${pageNumber} of ${pageCount}`,
          200, 290, { align: 'right' });
      },
      didParseCell: function (data: any) {
        if (data.column.dataKey === 'content') {
          data.cell.styles.valign = 'top';
          data.cell.styles.fontStyle = 'normal';
        }
      },
    });
    doc.save("announcements.pdf");
  }, [announcements]);

  const handleAddAnnouncement = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) {
      setFormError("Title, content, and category are required!");
      return;
    }
    if (category === "Event" && !eventDate) {
      setFormError("Event date is required for events!");
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, pinned, expiresAt, eventDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create announcement");
      }
      const newAnnouncement = await res.json();
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle("");
      setContent("");
      setCategory("Update");
      setPinned(false);
      setExpiresAt("");
      setEventDate("");
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }, [title, content, category, pinned, expiresAt, eventDate, announcements]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete announcement");
      }
      setAnnouncements(anns => anns.filter(a => a._id !== id));
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => (
    announcements.filter(a => {
      const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
  ), [announcements, categoryFilter, search]);

  const pinnedAnnouncements = useMemo(() => (
    filteredAnnouncements
      .filter(a => a.pinned)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  ), [filteredAnnouncements]);

  const otherAnnouncements = useMemo(() => (
    filteredAnnouncements
      .filter(a => !a.pinned)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  ), [filteredAnnouncements]);

  const displayedAnnouncements = useMemo(() => (
    activeTab === 'pinned' ? pinnedAnnouncements : filteredAnnouncements
  ), [activeTab, pinnedAnnouncements, filteredAnnouncements]);

  const handleCardClick = useCallback((announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDetailsModalOpen(false);
    setSelectedAnnouncement(null);
  }, []);

  return {
    theme,
    t,
    announcements,
    setAnnouncements,
    title,
    setTitle,
    content,
    setContent,
    category,
    setCategory,
    pinned,
    setPinned,
    showForm,
    setShowForm,
    loading,
    setLoading,
    formError,
    setFormError,
    currentUser,
    setCurrentUser,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    expiresAt,
    setExpiresAt,
    activeTab,
    setActiveTab,
    eventDate,
    setEventDate,
    selectedAnnouncement,
    setSelectedAnnouncement,
    detailsModalOpen,
    setDetailsModalOpen,
    categories,
    isAdmin,
    handlePinToggle,
    handleComment,
    handleExportCSV,
    handleExportPDF,
    handleAddAnnouncement,
    handleDelete,
    filteredAnnouncements,
    pinnedAnnouncements,
    otherAnnouncements,
    displayedAnnouncements,
    handleCardClick,
    handleCloseModal,
  };
}
