import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import AddRoleModal from "./AddRoleModal";

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
    try {
      await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departments }),
      });
      fetchOrgChart();
    } catch (error) {
      console.error("Error saving org chart:", error);
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
    // Save to backend immediately
    await fetch("/api/org-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departments: newDepartments }),
    });
    fetchOrgChart();
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

  // Drag and drop logic (between any department/level)
  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Parse droppableId: "deptId:levelId"
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
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Organizational Chart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-all text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Admin Role */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Admin</h3>
          <div className="bg-red-100 text-red-700 p-2 rounded-md shadow text-center border border-red-200">
            {fixedAdminRole}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-row gap-6 overflow-x-auto">
            {departments.map((dept) => (
              <div key={dept.id} className="border rounded-lg p-4 min-w-[320px] bg-white shadow flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-center border-b pb-2">{dept.name}</h3>
                {/* Levels container with scroll */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: 350 }}>
                  {dept.levels.map((level, idx) => (
                    <div key={level.id} className="mb-4 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold mb-1 px-3 pt-2">Level {idx + 1}</h4>
                      <Droppable droppableId={`${dept.id}:${level.id}`}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="min-h-[50px] bg-green-50 rounded p-2"
                          >
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
                                    className={`bg-green-100 text-green-700 p-2 rounded-md my-1 shadow-sm cursor-grab transition-transform duration-200 ${
                                      snapshot.isDragging
                                        ? "transform scale-105"
                                        : ""
                                    }`}
                                  >
                                    {role}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
                <button
                  className="bg-gray-200 px-3 py-1 rounded text-sm mt-2 w-full"
                  onClick={() => handleAddLevel(dept.id)}
                >
                  <FaPlus className="inline mr-1" /> Add Level
                </button>
                {/* Add Role button only for Available Roles */}
                {dept.id === AVAILABLE_DEPT_ID && (
                  <button
                    className="bg-gray-200 px-3 py-1 rounded text-sm mt-2 w-full"
                    onClick={() => setShowAddRoleModal(true)}
                  >
                    <FaPlus className="inline mr-1" /> Add Role
                  </button>
                )}
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Add Department */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="text"
            placeholder="Department name"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            onClick={handleAddDepartment}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-xl shadow-md"
          >
            <FaPlus className="inline mr-1" /> Add Department
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={saveOrgChart}
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-95"
          >
            <FaSave className="mr-2" />
            Save Chart
          </button>
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
