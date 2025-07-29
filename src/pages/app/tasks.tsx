import React from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import TaskForm from "@/components/tasks/TaskForm";
import { createPortal } from 'react-dom';
import TasksHeader from "@/components/tasks/TasksHeader";
import TasksTabPanel from "@/components/tasks/TasksTabPanel";
import { useTasks } from "@/hooks/useTasks";

interface TaskUser {
  _id: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userId: string | TaskUser | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isSubtask?: boolean;
  parentTask?: string;
  subtasks?: Task[];
}

const TasksPage: NextPageWithLayout = React.memo(() => {
  const {
    theme,
    activeTab,
    setActiveTab,
    tasks,
    assignedTasks,
    usersBelowMe,
    currentUserEmail,
    currentUserId,
    showForm,
    setShowForm,
    editingTaskId,
    setEditingTaskId,
    taskTitle,
    setTaskTitle,
    taskDescription,
    setTaskDescription,
    taskDeadline,
    setTaskDeadline,
    assignedTo,
    setAssignedTo,
    priority,
    setPriority,
    formError,
    setFormError,
    loading,
    listError,
    mySearch,
    setMySearch,
    myFilterStatus,
    setMyFilterStatus,
    myFilterPriority,
    setMyFilterPriority,
    mySortBy,
    setMySortBy,
    assignedSearch,
    setAssignedSearch,
    assignedFilterStatus,
    setAssignedFilterStatus,
    assignedFilterPriority,
    setAssignedFilterPriority,
    assignedSortBy,
    setAssignedSortBy,
    fetchTasks,
    fetchAssignedTasks,
    resetForm,
    handleAddTask,
    handleDeleteTask,
    handleToggleComplete,
    handleEditClick,
    handleClose,
    t,
    isTaskOverdue,
  } = useTasks();

  const handleExportCSV = React.useCallback(() => {
    const allTasks = activeTab === 'my-tasks' ? tasks : assignedTasks;
    if (!allTasks.length) return;
    const rows = [
      ["Title", "Description", "Deadline", "Completed", "Created By", "Created At"],
      ...allTasks.map(t => [
        t.title,
        t.description || "",
        t.deadline ? new Date(t.deadline).toLocaleString() : "",
        t.completed ? "Yes" : "No",
        t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : "",
        t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
      ])
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    // @ts-ignore
    (window.saveAs || require('file-saver').saveAs)(blob, `tasks_${activeTab}.csv`);
  }, [tasks, assignedTasks, activeTab]);

  const handleExportPDF = React.useCallback(() => {
    const allTasks = activeTab === 'my-tasks' ? tasks : assignedTasks;
    if (!allTasks.length) return;
    const jsPDF = require('jspdf').default;
    const autoTableModule = require('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("Tasks Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    const columns = [
      { header: "Title", dataKey: "title" },
      { header: "Description", dataKey: "description" },
      { header: "Deadline", dataKey: "deadline" },
      { header: "Completed", dataKey: "completed" },
      { header: "Created By", dataKey: "createdBy" },
      { header: "Created At", dataKey: "createdAt" },
    ];
    const rows = allTasks.map(t => ({
      title: t.title,
      description: (t.description || "").replace(/\r\n|\r|\n/g, "\n"),
      deadline: t.deadline ? new Date(t.deadline).toLocaleString() : "",
      completed: t.completed ? "Yes" : "No",
      createdBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : "",
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    }));
    const colWidths = {
      title: 32,
      description: 60,
      deadline: 32,
      completed: 20,
      createdBy: 32,
      createdAt: 32,
    };
    const totalWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
    const margin = (210 - totalWidth) / 2;
    autoTable(doc, {
      startY: 38,
      columns,
      body: rows,
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'left',
        valign: 'middle',
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 34,
        cellPadding: 2,
        halign: 'left',
        valign: 'top',
        lineColor: [220, 220, 220],
        minCellHeight: 7,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
        textColor: 34,
      },
      columnStyles: {
        title: { cellWidth: colWidths.title },
        description: { cellWidth: colWidths.description },
        deadline: { cellWidth: colWidths.deadline },
        completed: { cellWidth: colWidths.completed },
        createdBy: { cellWidth: colWidths.createdBy },
        createdAt: { cellWidth: colWidths.createdAt },
      },
      margin: { left: margin, right: margin },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        minCellHeight: 7,
        textColor: 34,
      },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${pageNumber} of ${pageCount}`,
          200, 290, { align: 'right' });
      },
      didParseCell: function (data: any) {
        if (data.column.dataKey === 'description') {
          data.cell.styles.valign = 'top';
          data.cell.styles.fontStyle = 'normal';
        }
      },
    });
    doc.save(`tasks_${activeTab}.pdf`);
  }, [tasks, assignedTasks, activeTab]);

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <TasksHeader
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreate={() => { resetForm(); setShowForm(true); }}
        loading={loading}
        t={t}
      />
      <div className="px-2 lg:px-4 pt-4">
        <div className="max-w-[100vw] mx-auto">
          <TasksTabPanel
            theme={theme}
            activeTab={activeTab}
            t={t}
            tasks={tasks}
            assignedTasks={assignedTasks}
            loading={loading}
            currentUserEmail={currentUserEmail}
            handleEditClick={handleEditClick}
            handleDeleteTask={handleDeleteTask}
            handleToggleComplete={handleToggleComplete}
            isTaskOverdue={isTaskOverdue}
            mySearch={mySearch}
            setMySearch={setMySearch}
            myFilterStatus={myFilterStatus}
            setMyFilterStatus={setMyFilterStatus}
            myFilterPriority={myFilterPriority}
            setMyFilterPriority={setMyFilterPriority}
            mySortBy={mySortBy}
            setMySortBy={setMySortBy}
            assignedSearch={assignedSearch}
            setAssignedSearch={setAssignedSearch}
            assignedFilterStatus={assignedFilterStatus}
            setAssignedFilterStatus={setAssignedFilterStatus}
            assignedFilterPriority={assignedFilterPriority}
            setAssignedFilterPriority={setAssignedFilterPriority}
            assignedSortBy={assignedSortBy}
            setAssignedSortBy={setAssignedSortBy}
            handleExportPDF={handleExportPDF}
            handleExportCSV={handleExportCSV}
            refetchTasks={fetchTasks}
            refetchAssignedTasks={fetchAssignedTasks}
          />
        </div>
      </div>
      {showForm && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] relative animate-fadeIn overflow-hidden">
            <TaskForm
              show={true}
              loading={loading}
              editingTaskId={editingTaskId}
              taskTitle={taskTitle}
              taskDescription={taskDescription}
              taskDeadline={taskDeadline}
              assignedTo={assignedTo}
              usersBelowMe={usersBelowMe}
              formError={formError}
              theme={theme}
              priority={priority}
              onTitleChange={setTaskTitle}
              onDescriptionChange={setTaskDescription}
              onDeadlineChange={setTaskDeadline}
              onAssignedToChange={setAssignedTo}
              onPriorityChange={setPriority}
              onSubmit={handleAddTask}
              onCancel={handleClose}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

TasksPage.getLayout = function getLayout(page: React.ReactElement) {
  const locale = (page.props as any)?.locale;
  return <DashboardLayout locale={locale}>{page}</DashboardLayout>;
};

export default React.memo(TasksPage);