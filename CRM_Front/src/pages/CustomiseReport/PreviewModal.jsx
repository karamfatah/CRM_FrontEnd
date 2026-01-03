import React from 'react';

const PreviewModal = ({ gridLayout, logo, template, onClose, t }) => {
  const getSampleValue = (type) => {
    switch (type) {
      case 'text': return 'Sample Text';
      case 'checkbox': return '☑ Checked';
      case 'dropdown': return 'Option 1';
      case 'image': return 'Image Placeholder';
      case 'multi_image': return 'Multiple Images';
      case 'PDF': return 'PDF Document';
      case 'radio': return 'Selected Option';
      case 'Date': return '2023-01-01';
      case 'DateTime': return '2023-01-01 12:00';
      case 'Time': return '12:00';
      default: return 'Data';
    }
  };

  const resolveField = (path) => {
    try {
      const pathParts = path.split('.');
      let field = template;
      for (const part of pathParts) {
        if (!field) return null;
        const match = part.match(/\[(\d+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const key = part.slice(0, -match[0].length);
          field = field[key]?.[index];
        } else {
          field = field[part];
        }
      }
      return field;
    } catch (error) {
      console.error(`Error resolving path ${path}:`, error);
      return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-[794px] h-[1123px] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 dark:text-gray-300"
        >
          ×
        </button>
        {logo.url && (
          <img
            src={logo.url}
            alt="Logo"
            className={`w-32 h-16 object-contain ${logo.position === 'top-left' ? 'float-left' : 'float-right'}`}
          />
        )}
        <div className="grid grid-cols-12 gap-4 mt-20">
          {gridLayout.map((item, index) => {
            const field = resolveField(item.content.path);
            return (
              <div
                key={`${item.row}-${item.col}-${index}`}
                className={`col-span-${item.span} p-2`}
                style={{
                  gridRow: item.row + 1,
                  fontSize: `${item.content.properties.fontSize}px`,
                  fontWeight: item.content.properties.bold ? 'bold' : 'normal',
                  fontStyle: item.content.properties.italic ? 'italic' : 'normal',
                }}
              >
                <strong>{item.content.properties.label}:</strong>{' '}
                {field
                  ? item.content.type === 'field'
                    ? getSampleValue(field.type)
                    : field.name || 'Section'
                  : 'Invalid Field'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;