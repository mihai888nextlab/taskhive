import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";

interface OrgChartModalProps {
  onClose: () => void;
  roles: string[];
}

interface Level {
  id: string;
  roles: string[];
}

const OrgChartModal: React.FC<OrgChartModalProps> = ({ onClose }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const fixedAdminRole = "admin";

  const fetchOrgChart = useCallback(async () => {
    try {
      const response = await fetch("/api/org-chart");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setLevels(data.levels);
          setAvailableRoles(data.availableRoles);
          console.log("Fetched data:", data); // Add this line
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
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error("Error saving org chart:", error);
    }
  }, [levels, availableRoles, onClose]);

  const handleSaveChart = () => {
    saveOrgChart();
  };

  const onDragEnd = useCallback(
    (result: { destination: any; source: any; draggableId: any }) => {
      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const startLevelId = source.droppableId;
      const endLevelId = destination.droppableId;

      if (startLevelId === "available-roles") {
        // Dragging from available roles to a level
        const newAvailableRoles = [...availableRoles];
        const newLevels = [...levels];

        const roleToAdd = draggableId;

        const destinationLevelIndex = newLevels.findIndex(
          (level) => level.id === endLevelId
        );
        newLevels[destinationLevelIndex].roles.push(roleToAdd);

        setAvailableRoles(
          newAvailableRoles.filter((role) => role !== roleToAdd)
        );
        setLevels(newLevels);
      } else {
        // Dragging from one level to another
        const startLevelIndex = levels.findIndex(
          (level) => level.id === startLevelId
        );
        const endLevelIndex = levels.findIndex(
          (level) => level.id === endLevelId
        );

        const newLevels = [...levels];
        const roleToMove = newLevels[startLevelIndex].roles[source.index];

        // Remove from source
        newLevels[startLevelIndex].roles.splice(source.index, 1);

        // Add to destination
        newLevels[endLevelIndex].roles.splice(destination.index, 0, roleToMove); // Insert at the correct index

        setLevels(newLevels);
      }
    },
    [availableRoles, levels]
  );

  const handleCreateLevel = () => {
    const newLevelId = uuidv4();
    const newLevel: Level = { id: newLevelId, roles: [] };
    setLevels([...levels, newLevel]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-grow">
            {/* Levels */}
            <div
              className="w-full flex flex-col items-start overflow-y-auto custom-scrollbar"
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
                  <Droppable droppableId={level.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[50px]"
                      >
                        {level.roles.map((role, index) => (
                          <Draggable
                            key={role}
                            draggableId={`${role}-${level.id}`}
                            index={index}
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
          </div>
        </DragDropContext>

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
