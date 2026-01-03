import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const GridLayout = ({ gridLayout, logo, onLogoUpload, onLogoPosition, onSpanChange, onFieldEdit, t }) => {
  return (
    <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700" style={{ width: '794px', height: '1123px' }}>
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('customise_report.add_logo')}
        </label>
        <div className="flex space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          />
          <select
            value={logo.position}
            onChange={(e) => onLogoPosition(e.target.value)}
            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>
        {logo.url && (
          <img
            src={logo.url}
            alt="Logo Preview"
            className={`w-32 h-32 object-contain ${logo.position === 'top-left' ? 'float-left' : 'float-right'}`}
          />
        )}
      </div>
      <div className="grid grid-cols-12 gap-2" style={{ height: 'calc(1123px - 200px)' }}>
        {[...Array(20)].map((_, row) =>
          [...Array(12)].map((_, col) => {
            const item = gridLayout.find((i) => i.row === row && i.col === col);
            const { setNodeRef, isOver } = useDroppable({
              id: `grid-${row}-${col}`,
              data: { row, col },
            });
            return (
              <div
                key={`grid-${row}-${col}`}
                ref={setNodeRef}
                className={`border h-20 bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-sm col-span-${item?.span || 1} ${
                  isOver ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-500'
                } transition-colors min-w-0`}
                onClick={() => item && onFieldEdit(row, col)}
                style={{ position: 'relative' }}
              >
                {item ? (
                  <div className="flex items-center space-x-2 w-full px-2">
                    <span
                      className={`truncate ${item.content.properties.bold ? 'font-bold' : ''} ${
                        item.content.properties.italic ? 'italic' : ''
                      }`}
                      style={{ fontSize: `${item.content.properties.fontSize}px` }}
                    >
                      {item.content.properties.label}
                    </span>
                    <select
                      value={item.span}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onSpanChange(row, col, parseInt(e.target.value))}
                      className="p-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Span {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-gray-400">Drop here</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GridLayout;