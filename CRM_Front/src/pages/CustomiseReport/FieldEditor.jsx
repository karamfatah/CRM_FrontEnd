import React, { useState } from 'react';

const FieldEditor = ({ field, onSave, onClose, t }) => {
  const [properties, setProperties] = useState({
    label: field?.properties?.label || '',
    fontSize: field?.properties?.fontSize || 14,
    bold: field?.properties?.bold || false,
    italic: field?.properties?.italic || false,
  });

  const handleChange = (key, value) => {
    setProperties((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(properties);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {t('customise_report.edit_field')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Label</label>
            <input
              type="text"
              value={properties.label}
              onChange={(e) => handleChange('label', e.target.value)}
              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
            <input
              type="number"
              value={properties.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              min="8"
              max="72"
              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={properties.bold}
                onChange={(e) => handleChange('bold', e.target.checked)}
                className="mr-2"
              />
              Bold
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={properties.italic}
                onChange={(e) => handleChange('italic', e.target.checked)}
                className="mr-2"
              />
              Italic
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldEditor;