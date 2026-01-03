import React, { useState, useEffect, useReducer } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import reportService from '../../lib/reportService';
import { DndContext, closestCenter, PointerSensor } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import TemplateTree from './TemplateTree';
import GridLayout from './GridLayout';
import FieldEditor from './FieldEditor';
import PreviewModal from './PreviewModal';

const historyReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return {
        past: [...state.past, state.present],
        present: action.payload,
        future: [],
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      };
    default:
      return state;
  }
};

const CustomiseReport = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [template, setTemplate] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState('');
  const [logo, setLogo] = useState({ position: 'top-left', url: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [history, dispatchHistory] = useReducer(historyReducer, {
    past: [],
    present: [],
    future: [],
  });

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('customise_report.error.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
      fetchTemplateNames();
      fetchLayouts();
    } else {
      setError(t('customise_report.error.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  const fetchTemplateNames = async () => {
    try {
      const templates = await reportService.getTemplateNames();
      setTemplates(templates);
      setLoading(false);
    } catch (err) {
      setError(t('customise_report.error.fetch_template', { message: err.message }));
      setLoading(false);
    }
  };

  const fetchLayouts = async () => {
    try {
      const { data } = await reportService.fetchLayouts(authData.org_id);
      setLayouts(data);
    } catch (err) {
      setError(t('customise_report.error.fetch_layouts', { message: err.message }));
    }
  };

  const fetchTemplate = async (templateId) => {
    try {
      const data = await reportService.fetchTemplate(templateId);
      setTemplate(data);
      if (!selectedLayoutId) {
        dispatchHistory({ type: 'ADD', payload: [] });
        setLogo({ position: 'top-left', url: '' });
      }
    } catch (err) {
      setError(t('customise_report.error.fetch_template', { message: err.message }));
    }
  };

  useEffect(() => {
    if (selectedTemplateId) {
      fetchTemplate(selectedTemplateId);
    } else {
      setTemplate(null);
      dispatchHistory({ type: 'ADD', payload: [] });
      setLogo({ position: 'top-left', url: '' });
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    if (selectedLayoutId) {
      const layout = layouts.find((l) => l._id === selectedLayoutId);
      if (layout) {
        setSelectedTemplateId(layout.template_id);
        dispatchHistory({ type: 'ADD', payload: layout.layout.grid });
        setLogo(layout.layout.logo);
      }
    }
  }, [selectedLayoutId, layouts]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      console.log('No drop target detected');
      return;
    }

    console.log('Drag ended:', { activeId: active.id, overId: over.id });

    let item;
    try {
      item = JSON.parse(active.id);
    } catch (e) {
      console.error('Invalid draggable ID:', active.id);
      toast.error(t('customise_report.error.invalid_item'));
      return;
    }

    const newGridLayout = [...history.present];

    if (over.id.startsWith('grid-')) {
      const [_, row, col] = over.id.split('-').map(Number);
      if (isNaN(row) || isNaN(col)) {
        console.error('Invalid grid coordinates:', { row, col });
        toast.error(t('customise_report.error.invalid_drop'));
        return;
      }
      const existingItem = newGridLayout.find((i) => i.row === row && i.col === col);
      if (existingItem) {
        toast.error(t('customise_report.error.cell_occupied_message'));
        return;
      }

      newGridLayout.push({
        row,
        col,
        span: 1,
        content: {
          type: item.type,
          path: item.path,
          properties: { label: item.name, fontSize: 14, bold: false, italic: false },
        },
      });
      dispatchHistory({ type: 'ADD', payload: newGridLayout });
      console.log('New grid layout:', newGridLayout);
    }
  };

  const handleSpanChange = (row, col, span) => {
    const newGridLayout = history.present.map((item) =>
      item.row === row && item.col === col ? { ...item, span } : item
    );
    dispatchHistory({ type: 'ADD', payload: newGridLayout });
  };

  const handleFieldEdit = (row, col, properties) => {
    const newGridLayout = history.present.map((item) =>
      item.row === row && item.col === col
        ? { ...item, content: { ...item.content, properties } }
        : item
    );
    dispatchHistory({ type: 'ADD', payload: newGridLayout });
    setEditingField(null);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const logoUrl = await reportService.uploadLogo(file, authData.org_id);
        setLogo((prev) => ({ ...prev, url: logoUrl }));
        toast.success(t('customise_report.logo_uploaded'));
      } catch (error) {
        toast.error(t('customise_report.error.upload_logo', { message: error.message }));
      }
    }
  };

  const handleLogoPosition = (position) => {
    setLogo((prev) => ({ ...prev, position }));
  };

  const handleSaveLayout = async () => {
    if (!hasPrivilege) {
      setError(t('customise_report.error.no_permission'));
      return;
    }
    if (!selectedTemplateId) {
      setError(t('customise_report.select_template'));
      return;
    }
    if (!history.present.length) {
      setError(t('customise_report.error.empty_layout'));
      return;
    }

    const orgId = parseInt(authData.org_id, 10);
    if (isNaN(orgId)) {
      setError(t('customise_report.invalid_org_id') || 'Invalid organization ID');
      return;
    }

    const layout = {
      template_id: selectedTemplateId,
      org_id: orgId,
      created_by: authData.user_id || 'user_001',
      name: `Layout for ${template?.name || 'Untitled'}`,
      layout: {
        grid: history.present,
        logo,
      },
    };

    try {
      const result = await reportService.saveLayout(layout);
      setError('');
      toast.success(t('customise_report.layout_saved', { id: result.insertedId }));
      fetchLayouts();
    } catch (err) {
      setError(t('customise_report.error.save_layout', { message: err.message }));
    }
  };

  const handleUndo = () => dispatchHistory({ type: 'UNDO' });
  const handleRedo = () => dispatchHistory({ type: 'REDO' });

  if (authLoading || !authData || loading) {
    return <LoadingSpinner />;
  }

  console.log('Sidebar state:', { sidebarOpen, setSidebarOpen });

  return (
    <div className="flex h-screen overflow-hidden">
      {typeof sidebarOpen === 'undefined' ? (
        <p className="text-red-500">Error: Sidebar state is undefined</p>
      ) : (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t('customise_report.title')}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {t('customise_report.title')}
              </h2>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customise_report.select_template')}
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">{t('customise_report.select_template')}</option>
                    {templates.map((temp) => (
                      <option key={temp._id} value={temp._id}>
                        {temp.name} (Type: {temp.reportType})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customise_report.select_layout')}
                  </label>
                  <select
                    value={selectedLayoutId}
                    onChange={(e) => setSelectedLayoutId(e.target.value)}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">{t('customise_report.select_layout')}</option>
                    {layouts.map((layout) => (
                      <option key={layout._id} value={layout._id}>
                        {layout.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {template && (
                <DndContext
                  sensors={[{ sensor: PointerSensor, options: { activationConstraint: { distance: 5 } } }]}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                        {t('customise_report.grid_layout')}
                      </h3>
                      <div className="flex space-x-4 mb-4">
                        <button
                          onClick={handleUndo}
                          disabled={history.past.length === 0}
                          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md disabled:opacity-50"
                        >
                          {t('customise_report.undo')}
                        </button>
                        <button
                          onClick={handleRedo}
                          disabled={history.future.length === 0}
                          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md disabled:opacity-50"
                        >
                          {t('customise_report.redo')}
                        </button>
                        <button
                          onClick={() => setShowPreview(true)}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md"
                        >
                          {t('customise_report.preview')}
                        </button>
                        <button
                          onClick={handleSaveLayout}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md"
                        >
                          {t('customise_report.save_layout')}
                        </button>
                      </div>
                      <GridLayout
                        gridLayout={history.present}
                        logo={logo}
                        onLogoUpload={handleLogoUpload}
                        onLogoPosition={handleLogoPosition}
                        onSpanChange={handleSpanChange}
                        onFieldEdit={(row, col) => setEditingField({ row, col })}
                        t={t}
                      />
                    </div>
                    <div className="w-1/2 overflow-y-auto max-h-[80vh]">
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                        {t('customise_report.template_structure')}
                      </h3>
                      <TemplateTree template={template} />
                    </div>
                  </div>
                </DndContext>
              )}
            </div>
          </div>
          {showPreview && (
            <PreviewModal
              gridLayout={history.present}
              logo={logo}
              template={template}
              onClose={() => setShowPreview(false)}
              t={t}
            />
          )}
          {editingField && (
            <FieldEditor
              field={history.present.find(
                (item) => item.row === editingField.row && item.col === editingField.col
              )?.content}
              onSave={(properties) => handleFieldEdit(editingField.row, editingField.col, properties)}
              onClose={() => setEditingField(null)}
              t={t}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomiseReport;