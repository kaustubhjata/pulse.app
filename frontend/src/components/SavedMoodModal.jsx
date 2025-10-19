import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

export default function SavedMoodModal({
  open,
  onClose,
  moodLabel,
  category,
  subcategory,
  tip,
  note,
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 w-[320px]">
      <div className="bg-white shadow-lg rounded-lg p-4 flex gap-3 items-start">
        <div className="flex-shrink-0 p-2 rounded-full bg-teal-100">
          <CheckCircle className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                Mood saved
              </div>
              <div className="text-xs text-gray-600">
                {moodLabel}
                {category
                  ? ` • ${category}${subcategory ? ` › ${subcategory}` : ""}`
                  : ""}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {tip && <div className="text-xs mt-2 text-gray-700">Tip: {tip}</div>}
          {note && (
            <div className="text-xs mt-1 text-gray-600 italic">"{note}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
