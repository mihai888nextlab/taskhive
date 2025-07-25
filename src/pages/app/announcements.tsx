import React from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import AnnouncementsHeader from "@/components/announcements/AnnouncementsHeader";
import AnnouncementsMainContainer from "@/components/announcements/AnnouncementsMainContainer";
import AnnouncementFormModal from "@/components/announcements/AnnouncementFormModal";
import AnnouncementDetailsModalWrapper from "@/components/announcements/AnnouncementDetailsModalWrapper";
import { useAnnouncements } from "@/hooks/useAnnouncements";

const AnnouncementsPage: NextPageWithLayout = React.memo(() => {
  const {
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
  } = useAnnouncements();

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <AnnouncementsHeader
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onShowForm={() => setShowForm(true)}
        pinnedCount={pinnedAnnouncements.length}
        t={t}
      />
      <AnnouncementsMainContainer
        theme={theme}
        activeTab={activeTab}
        t={t}
        displayedAnnouncements={displayedAnnouncements}
        pinnedAnnouncements={pinnedAnnouncements}
        loading={loading}
        isAdmin={isAdmin}
        handlePinToggle={handlePinToggle}
        handleComment={handleComment}
        handleDelete={handleDelete}
        handleCardClick={handleCardClick}
        handleExportPDF={handleExportPDF}
        handleExportCSV={handleExportCSV}
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      <AnnouncementFormModal
        open={showForm}
        theme={theme}
        title={title}
        content={content}
        category={category}
        pinned={pinned}
        expiresAt={expiresAt}
        eventDate={eventDate}
        loading={loading}
        formError={formError}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onCategoryChange={setCategory}
        onPinnedChange={setPinned}
        onExpiresAtChange={setExpiresAt}
        onEventDateChange={setEventDate}
        onSubmit={handleAddAnnouncement}
        onCancel={() => setShowForm(false)}
      />
      <AnnouncementDetailsModalWrapper
        open={detailsModalOpen}
        announcement={selectedAnnouncement}
        onClose={handleCloseModal}
        onDelete={handleDelete}
        onPinToggle={handlePinToggle}
        isAdmin={isAdmin}
      />
    </div>
  );
});

AnnouncementsPage.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default React.memo(AnnouncementsPage);