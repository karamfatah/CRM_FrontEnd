import React from 'react';
import { useDraggable } from '@dnd-kit/core';

const TemplateTree = ({ template }) => {
  const renderSection = (section, sectionKey, parentPath = '') => (
    <div className="ml-4">
      {template?.structure?.[section]?.[sectionKey]?.map((sub, subIndex) => {
        const subPath = `${parentPath}${section}.sub_${sectionKey}[${subIndex}]`;
        const subId = JSON.stringify({ type: 'sub_section', path: subPath, name: sub.name });
        return (
          <div key={sub.name} className="border-b py-2">
            <DraggableItem id={subId}>
              <div className="cursor-grab text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded active:cursor-grabbing">
                {sub.name}
              </div>
            </DraggableItem>
            <div className="ml-4">
              {sub.fields?.map((field, fieldIndex) => {
                const fieldPath = `${subPath}.fields[${fieldIndex}]`;
                const fieldId = JSON.stringify({ type: 'field', path: fieldPath, name: field.name });
                return (
                  <DraggableItem key={field.name} id={fieldId}>
                    <div className="cursor-grab text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded active:cursor-grabbing">
                      {field.name} ({field.type})
                    </div>
                  </DraggableItem>
                );
              })}
              {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
                (subSub, subSubIndex) => {
                  const subSubPath = `${subPath}.sub_sub_${sectionKey}[${subSubIndex}]`;
                  const subSubId = JSON.stringify({
                    type: 'sub_sub_section',
                    path: subSubPath,
                    name: subSub.name,
                  });
                  return (
                    <div key={subSub.name} className="ml-4">
                      <DraggableItem id={subSubId}>
                        <div className="cursor-grab text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded active:cursor-grabbing">
                          {subSub.name}
                        </div>
                      </DraggableItem>
                      {subSub.fields?.map((field, fieldIndex) => {
                        const fieldPath = `${subSubPath}.fields[${fieldIndex}]`;
                        const fieldId = JSON.stringify({
                          type: 'field',
                          path: fieldPath,
                          name: field.name,
                        });
                        return (
                          <DraggableItem key={field.name} id={fieldId}>
                            <div className="cursor-grab text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded ml-4 active:cursor-grabbing">
                              {field.name} ({field.type})
                            </div>
                          </DraggableItem>
                        );
                      })}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const DraggableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={isDragging ? 'opacity-50' : 'opacity-100'}
        onClick={() => console.log('Draggable ID:', id)}
      >
        {children}
      </div>
    );
  };

  return (
    <div>
      {template ? (
        <>
          {renderSection('header', 'sub_headers')}
          {renderSection('body', 'sub_bodies')}
          {renderSection('footer', 'sub_footers')}
        </>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">No template selected</p>
      )}
    </div>
  );
};

export default TemplateTree;