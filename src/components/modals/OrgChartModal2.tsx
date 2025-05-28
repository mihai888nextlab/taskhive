import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OrgChartModalProps {
  onClose: () => void;
  roles: string[];
}

interface Level {
  id: string;
  roles: string[];
}

const OrgChartModal: React.FC<OrgChartModalProps> = ({ onClose, roles }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<{
    role: string;
    from: string;
    index: number;
  } | null>(null);
  const fixedAdminRole = "admin";

  const fetchOrgChart = useCallback(async () => {
    try {
      const response = await fetch("/api/org-chart");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setLevels(data.levels);
          setAvailableRoles(data.availableRoles);
          return;
        }
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
      const response = await fetch("/api/org-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ levels, availableRoles }),
      });

      if (!response.ok) {
        console.error("Failed to save org chart.");
      }
      onClose();
    } catch (error) {
      console.error("Error saving org chart:", error);
    }
  }, [levels, availableRoles, onClose]);

  const handleSaveChart = () => {
    saveOrgChart();
  };

  const handleCreateLevel = () => {
    const newLevelId = uuidv4();
    const newLevel: Level = { id: newLevelId, roles: [] };
    setLevels([...levels, newLevel]);
  };

  // dnd-kit sensors
  const sensors = useSensors(useSensor(PointerSensor));

  // Helper to find the level index by droppable id
  const getLevelIndex = (droppableId: string) =>
    levels.findIndex((level) => level.id === droppableId);

  // Drag End Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRole(null);

    if (!over) return;

    const [activeRoleId, activeLevelId] = active.id.toString().split("::");
    const [overRoleId, overLevelId] = over.id.toString().split("::");

    // Dragging from available roles to a level
    if (
      activeLevelId === "available-roles" &&
      overLevelId !== "available-roles"
    ) {
      const destLevelIdx = getLevelIndex(overLevelId);
      if (destLevelIdx === -1) return;

      setAvailableRoles((prev) => prev.filter((r) => r !== activeRoleId));
      setLevels((prev) => {
        const newLevels = [...prev];
        newLevels[destLevelIdx].roles.push(activeRoleId);
        return newLevels;
      });
      return;
    }

    // Dragging within the same level (reorder)
    if (activeLevelId === overLevelId && activeLevelId !== "available-roles") {
      const levelIdx = getLevelIndex(activeLevelId);
      if (levelIdx === -1) return;

      const oldIndex = levels[levelIdx].roles.findIndex(
        (r) => r === activeRoleId
      );
      const newIndex = levels[levelIdx].roles.findIndex(
        (r) => r === overRoleId
      );
      if (oldIndex === -1 || newIndex === -1) return;

      setLevels((prev) => {
        const newLevels = [...prev];
        newLevels[levelIdx] = {
          ...newLevels[levelIdx],
          roles: arrayMove(newLevels[levelIdx].roles, oldIndex, newIndex),
        };
        return newLevels;
      });
      return;
    }

    // Dragging from one level to another
    if (
      activeLevelId !== overLevelId &&
      activeLevelId !== "available-roles" &&
      overLevelId !== "available-roles"
    ) {
      const fromLevelIdx = getLevelIndex(activeLevelId);
      const toLevelIdx = getLevelIndex(overLevelId);
      if (fromLevelIdx === -1 || toLevelIdx === -1) return;

      const oldIndex = levels[fromLevelIdx].roles.findIndex(
        (r) => r === activeRoleId
      );
      const newIndex = levels[toLevelIdx].roles.findIndex(
        (r) => r === overRoleId
      );
      if (oldIndex === -1) return;

      setLevels((prev) => {
        const newLevels = [...prev];
        // Remove from source
        const [removed] = newLevels[fromLevelIdx].roles.splice(oldIndex, 1);
        // Insert into destination at the correct index
        if (newIndex === -1) {
          newLevels[toLevelIdx].roles.push(removed);
        } else {
          newLevels[toLevelIdx].roles.splice(newIndex, 0, removed);
        }
        return newLevels;
      });
      return;
    }
  };

  // --- Sortable Role Component ---
  function SortableRole({
    role,
    levelId,
    index,
  }: {
    role: string;
    levelId: string;
    index: number;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `${role}::${levelId}` });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        }}
        className={`bg-green-100 text-green-700 p-2 rounded-md my-1 shadow-sm cursor-grab transition-transform duration-200 ${
          isDragging ? "scale-105" : ""
        }`}
        onPointerDown={() => setActiveRole({ role, from: levelId, index })}
      >
        {role}
      </div>
    );
  }

  // --- Sortable Available Role Component ---
  function SortableAvailableRole({
    role,
    index,
  }: {
    role: string;
    index: number;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: `${role}::available-roles` });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        }}
        className={`bg-blue-100 text-blue-700 p-2 rounded-md my-1 shadow-sm cursor-grab transition-transform duration-200 ${
          isDragging ? "scale-105" : ""
        }`}
        onPointerDown={() =>
          setActiveRole({ role, from: "available-roles", index })
        }
      >
        {role}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-xl border border-gray-200 w-3/4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Organizational Chart
          </h2>
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
          <div className="bg-red-100 text-red-700 p-2 rounded-md shadow-sm text-center">
            {fixedAdminRole}
          </div>
        </div>

        {/* Drag and Drop Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-grow gap-8">
            {/* Levels */}
            <div
              className="w-3/4 flex flex-col items-start overflow-y-auto custom-scrollbar"
              style={{ maxHeight: "500px" }}
            >
              {levels.map((level, levelIndex) => (
                <div
                  key={level.id}
                  className="w-full p-3 border rounded-lg mb-3"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">
                    Level {levelIndex + 1}
                  </h3>
                  <SortableContext
                    items={level.roles.map((role) => `${role}::${level.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="min-h-[50px]">
                      {level.roles.map((role, index) => (
                        <SortableRole
                          key={role}
                          role={role}
                          levelId={level.id}
                          index={index}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>

            {/* Available Roles */}
            <div className="w-1/4 p-3 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                Available Roles
              </h3>
              <SortableContext
                items={availableRoles.map((role) => `${role}::available-roles`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-[50px]">
                  {availableRoles.map((role, index) => (
                    <SortableAvailableRole
                      key={role}
                      role={role}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
          {/* Drag Overlay */}
          <DragOverlay>
            {activeRole ? (
              <div className="bg-yellow-100 text-yellow-700 p-2 rounded-md shadow-lg">
                {activeRole.role}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={handleCreateLevel}
            className="inline-flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
          >
            <FaPlus className="mr-2" />
            Create Level
          </button>
          <button
            onClick={handleSaveChart}
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 active:scale-95"
          >
            <FaSave className="mr-2" />
            Save Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgChartModal;
