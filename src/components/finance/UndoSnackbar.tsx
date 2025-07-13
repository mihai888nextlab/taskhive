import React from "react";
import { FaUndo } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface Props {
  show: boolean;
  onUndo: () => void;
  deletedItem: any;
}

const UndoSnackbar = React.memo(function UndoSnackbar({ show, onUndo, deletedItem }: Props) {
  const t = useTranslations("FinancePage");
  if (!show || !deletedItem) return null;
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50">
      <FaUndo className="mr-2" />
      <span>{t("itemDeleted")}</span>
      <Button
        onClick={onUndo}
        className="ml-4 underline font-bold"
        aria-label={t("undo")}
        variant="link"
      >
        {t("undo")}
      </Button>
    </div>
  );
});

export default React.memo(UndoSnackbar);