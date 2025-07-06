import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaSave, FaTimes, FaGripVertical, FaBuilding, FaUserTie, FaSitemap } from "react-icons/fa";
import AddRoleModal from "./AddRoleModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Level {
  id: string;
  roles: string[];
}

interface Department {
  id: string;
  name: string;
  levels: Level[];
}

interface OrgChartModalProps {
  onClose: () => void;
}

const AVAILABLE_DEPT_ID = "available-roles";
const AVAILABLE_DEPT_NAME = "Available Roles";
const fixedAdminRole = "admin";

const OrgChartModal: React.FC<OrgChartModalProps> = ({ onClose }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch org chart data
  const fetchOrgChart = useCallback(async () => {
    try {
      const response = await fetch("/api/org-chart");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Error fetching org chart:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrgChart();
  }, [fetchOrgChart]);

  const saveOrgChart = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departments }),
      });
      await fetchOrgChart();
    } catch (error) {
      console.error("Error saving org chart:", error);
    } finally {
      setSaving(false);
    }
  }, [departments, fetchOrgChart]);

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    const newDepartments = [
      ...departments,
      {
        id: uuidv4(),
        name: newDeptName.trim(),
        levels: [{ id: uuidv4(), roles: [] }],
      },
    ];
    setDepartments(newDepartments);
    setNewDeptName("");
    
    try {
      await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departments: newDepartments }),
      });
      await fetchOrgChart();
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  const handleAddLevel = (deptId: string) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === deptId
          ? {
              ...dept,
              levels: [...dept.levels, { id: uuidv4(), roles: [] }],
            }
          : dept
      )
    );
  };

  const handleRoleAdded = () => {
    fetchOrgChart();
  };

  // Drag and drop logic
  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const [srcDeptId, srcLevelId] = source.droppableId.split(":");
    const [destDeptId, destLevelId] = destination.droppableId.split(":");

    setDepartments((prev) => {
      let roleToMove = "";
      // Remove from source
      const removed = prev.map((dept) => {
        if (dept.id === srcDeptId) {
          return {
            ...dept,
            levels: dept.levels.map((lvl) => {
              if (lvl.id === srcLevelId) {
                roleToMove = lvl.roles[source.index];
                return {
                  ...lvl,
                  roles: lvl.roles.filter((_, idx) => idx !== source.index),
                };
              }
              return lvl;
            }),
          };
        }
        return dept;
      });

      // Add to destination
      return removed.map((dept) => {
        if (dept.id === destDeptId) {
          return {
            ...dept,
            levels: dept.levels.map((lvl) =>
              lvl.id === destLevelId
                ? {
                    ...lvl,
                    roles: [
                      ...lvl.roles.slice(0, destination.index),
                      roleToMove,
                      ...lvl.roles.slice(destination.index),
                    ],
                  }
                : lvl
            ),
          };
        }
        return dept;
      });
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative animate-fadeIn overflow-hidden">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-600 rounded-xl shadow-lg">
              <FaSitemap className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Organization Chart</h2>
              <p className="text-gray-600">Manage your team structure and role hierarchy</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Admin Section */}
          <div className="p-6 border-b border-gray-200 bg-red-50">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <FaUserTie className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Administrator Level</h3>
              </div>
              <div className="flex justify-center">
                <div className="bg-red-100 border-2 border-red-300 text-red-700 px-6 py-2 rounded-xl font-semibold shadow-lg text-lg min-w-full text-center">
                  {fixedAdminRole}
                </div>
              </div>
            </div>
          </div>

          {/* Departments Section */}
          <div className="flex-1 overflow-hidden">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="p-4 h-full overflow-x-auto">
                <div className="flex gap-6 min-h-0" style={{ minWidth: 'max-content' }}>
                  {departments.map((dept) => (
                    <div 
                      key={dept.id} 
                      className="bg-white border border-gray-200 rounded-2xl shadow-lg min-w-[320px] max-w-[320px] flex flex-col overflow-hidden"
                    >
                      {/* Department Header */}
                      <div className={`p-4 border-b border-gray-200 ${
                        dept.id === AVAILABLE_DEPT_ID 
                          ? 'bg-blue-50' 
                          : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            dept.id === AVAILABLE_DEPT_ID 
                              ? 'bg-blue-500' 
                              : 'bg-slate-500'
                          }`}>
                            <FaBuilding className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                            <p className="text-xs text-gray-600">
                              {dept.levels.reduce((acc, level) => acc + level.roles.length, 0)} roles
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Levels Container */}
                      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
                        <div className="space-y-4">
                          {dept.levels.map((level, idx) => (
                            <div key={level.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                              {/* Level Header */}
                              <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                                <h4 className="font-semibold text-sm text-gray-700">
                                  Level {idx + 1}
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({level.roles.length} roles)
                                  </span>
                                </h4>
                              </div>

                              {/* Droppable Area */}
                              <Droppable droppableId={`${dept.id}:${level.id}`}>
                                {(provided, snapshot) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`p-3 min-h-[60px] transition-all duration-200 ${
                                      snapshot.isDraggingOver 
                                        ? 'bg-emerald-100 border-emerald-300' 
                                        : 'bg-white'
                                    }`}
                                  >
                                    {level.roles.length === 0 ? (
                                      <div className="text-center py-4 text-gray-400 text-sm">
                                        Drop roles here
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {level.roles.map((role, i) => (
                                          <Draggable
                                            key={`${role}-${dept.id}-${level.id}`}
                                            draggableId={`${role}:::${dept.id}:::${level.id}`}
                                            index={i}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                ref={provided.innerRef}
                                                className={`group flex items-center gap-2 p-3 rounded-lg border cursor-grab transition-all duration-200 ${
                                                  snapshot.isDragging
                                                    ? "bg-emerald-100 border-emerald-300 shadow-lg transform scale-105"
                                                    : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md"
                                                }`}
                                              >
                                                <FaGripVertical className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                                                <span className="text-emerald-700 font-medium text-sm flex-1">
                                                  {role}
                                                </span>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                      </div>
                                    )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Department Actions */}
                      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                        <Button
                          type="button"
                          onClick={() => handleAddLevel(dept.id)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
                        >
                          <FaPlus className="w-3 h-3" />
                          Add Level
                        </Button>
                        {dept.id === AVAILABLE_DEPT_ID && (
                          <Button
                            type="button"
                            onClick={() => setShowAddRoleModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                          >
                            <FaPlus className="w-3 h-3" />
                            Add New Role
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Add Department */}
          <div className="flex gap-3 mb-4">
            <Input
              type="text"
              placeholder="Enter department name..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm"
            />
            <Button
              type="button"
              onClick={handleAddDepartment}
              disabled={!newDeptName.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                newDeptName.trim()
                  ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaPlus className="w-3 h-3 inline mr-1" />
              Add Department
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-200 text-sm"
              disabled={saving}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={saveOrgChart}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FaSave className="w-3 h-3" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* AddRoleModal */}
        {showAddRoleModal && (
          <AddRoleModal
            onClose={() => setShowAddRoleModal(false)}
            onRoleAdded={handleRoleAdded}
          />
        )}
      </div>
    </div>
  );
};

export default OrgChartModal;
