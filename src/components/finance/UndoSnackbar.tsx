import { FaUndo } from 'react-icons/fa';

interface Props {
  show: boolean;
  onUndo: () => void;
  deletedItem: any;
}

export default function UndoSnackbar({ show, onUndo, deletedItem }: Props) {
  if (!show || !deletedItem) return null;
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
      <FaUndo className="mr-2" />
      <span>Item deleted.</span>
      <button
        onClick={onUndo}
        className="ml-4 underline font-bold"
        aria-label="Undo delete"
      >
        Undo
      </button>
    </div>
  );
}