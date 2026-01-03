import React, { useState } from 'react';
import { useTemplate } from './TemplateContext';

const ManualTemplateCreator = () => {
  const {
    t,
    hasPrivilege,
    setError,
    reportNames,
    selectedReportType,
    setSelectedReportType,
    templateName,
    setTemplateName,
    createdBy,
    setCreatedBy,
    structure,
    setStructure,
    currentSubSection,
    setCurrentSubSection,
    currentSubSubSection,
    setCurrentSubSubSection,
    subNames,
    setSubNames,
    subSubNames,
    setSubSubNames,
    fieldInputs,
    setFieldInputs,
    selectedSubHeader,
    setSelectedSubHeader,
    editingSubHeader,
    setEditingSubHeader,
    editingSubSubHeader,
    setEditingSubSubHeader,
    editingField,
    setEditingField,
    templateResult,
    updatePreviews,
    handleSubmit,
  } = useTemplate();
  const [selectedSection, setSelectedSection] = useState('header');
  const [subMandatory, setSubMandatory] = useState({
    header: false,
    body: false,
    footer: false,
  });
  const [subSubMandatory, setSubSubMandatory] = useState({
    header: false,
    body: false,
    footer: false,
  });

  const addSubSection = (section) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const subName = subNames[section].trim();
    if (!subName) {
      setError(t('templates.enter_sub_name'));
      return;
    }

    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

    const isDuplicate = structure[section][subKey].some(
      (sub) => sub.name.toLowerCase() === subName.toLowerCase() && sub.name !== (editingSubHeader?.name || '')
    );
    if (isDuplicate) {
      setError(t('templates.duplicate_sub_name'));
      return;
    }

    if (editingSubHeader && editingSubHeader.section === section) {
      setStructure((prev) => {
        const updatedSubSections = prev[section][subKey].map((sub) =>
          sub.name === editingSubHeader.name ? { ...sub, name: subName, mandatory: subMandatory[section] } : sub
        );
        return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
      });
      setEditingSubHeader(null);
      if (selectedSubHeader[section] === editingSubHeader.name) {
        setSelectedSubHeader((prev) => ({ ...prev, [section]: subName }));
      }
      if (currentSubSection[section]?.name === editingSubHeader.name) {
        setCurrentSubSection((prev) => ({ ...prev, [section]: { ...prev[section], name: subName, mandatory: subMandatory[section] } }));
      }
    } else {
      const newSubSection = { name: subName, fields: [], [subSubKey]: [], mandatory: subMandatory[section] };
      setStructure((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subKey]: [...prev[section][subKey], newSubSection],
        },
      }));
      setCurrentSubSection((prev) => ({ ...prev, [section]: newSubSection }));
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
      setSelectedSubHeader((prev) => ({ ...prev, [section]: subName }));
    }
    setSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubMandatory((prev) => ({ ...prev, [section]: false }));
    setError('');
    updatePreviews();
  };

  const editSubSection = (section, subHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    console.log(`Editing sub-section: ${section}, ${subHeaderName}`);
    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSection = structure[section][subKey].find((sub) => sub.name === subHeaderName);
    if (!subSection) {
      setError(t('templates.sub_section_not_found'));
      return;
    }
    setEditingSubHeader({ section, name: subHeaderName });
    setSubNames((prev) => ({ ...prev, [section]: subHeaderName }));
    setSubMandatory((prev) => ({ ...prev, [section]: subSection.mandatory || false }));
    setEditingSubSubHeader(null);
    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
  };

  const deleteSubSection = (section, subHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const updatedSubSections = prev[section][subKey].filter((sub) => sub.name !== subHeaderName);
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    if (currentSubSection[section]?.name === subHeaderName) {
      setCurrentSubSection((prev) => ({ ...prev, [section]: null }));
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
    }
    if (selectedSubHeader[section] === subHeaderName) {
      setSelectedSubHeader((prev) => ({ ...prev, [section]: null }));
    }
    setEditingSubHeader(null);
    setSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubMandatory((prev) => ({ ...prev, [section]: false }));
    setError('');
    updatePreviews();
  };

  const addSubSubSection = (section) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const selectedHeaderName = selectedSubHeader[section];
    if (!selectedHeaderName) {
      setError(t('templates.select_sub_header_first'));
      return;
    }

    const subSubName = subSubNames[section].trim();
    if (!subSubName) {
      setError(t('templates.enter_sub_sub_name'));
      return;
    }

    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

    const parentSubSection = structure[section][subKey].find((sub) => sub.name === selectedHeaderName);
    const isDuplicate = parentSubSection[subSubKey]?.some(
      (subSub) => subSub.name.toLowerCase() === subSubName.toLowerCase() && subSub.name !== (editingSubSubHeader?.name || '')
    );
    if (isDuplicate) {
      setError(t('templates.duplicate_sub_sub_name'));
      return;
    }

    if (editingSubSubHeader && editingSubSubHeader.section === section) {
      setStructure((prev) => {
        const updatedSubSections = prev[section][subKey].map((sub) =>
          sub.name === selectedHeaderName
            ? {
                ...sub,
                [subSubKey]: sub[subSubKey].map((subSub) =>
                  subSub.name === editingSubSubHeader.name ? { ...subSub, name: subSubName, mandatory: subSubMandatory[section] } : subSub
                ),
              }
            : sub
        );
        return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
      });
      setEditingSubSubHeader(null);
      if (currentSubSubSection[section]?.name === editingSubSubHeader.name) {
        setCurrentSubSubSection((prev) => ({ ...prev, [section]: { ...prev[section], name: subSubName, mandatory: subSubMandatory[section] } }));
      }
    } else {
      const newSubSubSection = { name: subSubName, fields: [], mandatory: subSubMandatory[section] };
      setStructure((prev) => {
        const updatedSubSections = prev[section][subKey].map((sub) =>
          sub.name === selectedHeaderName
            ? { ...sub, [subSubKey]: [...(sub[subSubKey] || []), newSubSubSection] }
            : sub
        );
        return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
      });
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: newSubSubSection }));
    }
    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
    setError('');
    updatePreviews();
  };

  const editSubSubSection = (section, subSubHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    console.log(`Editing sub-sub-section: ${section}, ${subSubHeaderName}`);
    const selectedHeaderName = selectedSubHeader[section];
    if (!selectedHeaderName) {
      setError(t('templates.select_sub_header_first'));
      return;
    }
    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
    const parentSubSection = structure[section][subKey].find((sub) => sub.name === selectedHeaderName);
    const subSubSection = parentSubSection[subSubKey]?.find((subSub) => subSub.name === subSubHeaderName);
    if (!subSubSection) {
      setError(t('templates.sub_sub_section_not_found'));
      return;
    }
    setEditingSubSubHeader({ section, name: subSubHeaderName });
    setSubSubNames((prev) => ({ ...prev, [section]: subSubHeaderName }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: subSubSection.mandatory || false }));
    setEditingSubHeader(null);
    setSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubMandatory((prev) => ({ ...prev, [section]: false }));
  };

  const deleteSubSubSection = (section, subHeaderName, subSubHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSubSections = prev[section][subKey].map((sub) =>
        sub.name === subHeaderName
          ? { ...sub, [subSubKey]: sub[subSubKey].filter((subSub) => subSub.name !== subSubHeaderName) }
          : sub
      );
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    if (currentSubSubSection[section]?.name === subSubHeaderName) {
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
    }
    setEditingSubSubHeader(null);
    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
    setError('');
    updatePreviews();
  };

  const addField = (section) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const selectedHeaderName = selectedSubHeader[section];
    if (!selectedHeaderName) {
      setError(t('templates.select_sub_header_first'));
      return;
    }

    let { name, type, options, value, mandatory } = fieldInputs[section];
    if (!name.trim() && type !== 'score') {
      setError(t('templates.enter_field_name'));
      return;
    }

    if (type === 'score') {
      name = 'Score';
      type = 'radio';
      options = 'Pass,Fail';
      value = '';
    }

    const newField = {
      name: name.trim(),
      type,
      options:
        type === 'image' || type === 'multi_image' || type === 'PDF' || type === 'Date' || type === 'DateTime' || type === 'Time'
          ? []
          : options
          ? options.split(',').map((s) => s.trim()).filter((s) => s)
          : [],
      value:
        type === 'image' || type === 'multi_image' || type === 'PDF' || type === 'Time'
          ? ''
          : type === 'checkbox' || type === 'array'
          ? []
          : type === 'dropdown' || type === 'radio' || type === 'score'
          ? value || ''
          : type === 'Date' || type === 'DateTime'
          ? value || ''
          : value || '',
      mandatory,
    };

    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSubSections = prev[section][subKey].map((sub) => {
        if (sub.name !== selectedHeaderName) return sub;

        if (editingField && editingField.section === section) {
          if (editingField.level === 'subHeader') {
            return {
              ...sub,
              fields: sub.fields.map((field) =>
                field.name === editingField.fieldName ? newField : field
              ),
            };
          } else if (editingField.level === 'subSubHeader') {
            return {
              ...sub,
              [subSubKey]: sub[subSubKey].map((subSub) =>
                subSub.name === editingField.subSubHeaderName
                  ? {
                      ...subSub,
                      fields: subSub.fields.map((field) =>
                        field.name === editingField.fieldName ? newField : field
                      ),
                    }
                  : subSub
              ),
            };
          }
        }

        if (currentSubSubSection[section]) {
          return {
            ...sub,
            [subSubKey]: sub[subSubKey].map((subSub) =>
              subSub.name === currentSubSubSection[section].name
                ? { ...subSub, fields: [...subSub.fields, newField] }
                : subSub
            ),
          };
        } else {
          return {
            ...sub,
            fields: [...(sub.fields || []), newField],
          };
        }
      });
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    setFieldInputs((prev) => ({ ...prev, [section]: { name: '', type: 'text', options: '', value: '', mandatory: false } }));
    setEditingField(null);
    setError('');
    updatePreviews();
  };

  const editField = (section, fieldName, fieldData, level, subHeaderName, subSubHeaderName = null) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setEditingField({ section, fieldName, level, subHeaderName, subSubHeaderName });
    setFieldInputs((prev) => ({
      ...prev,
      [section]: {
        name: fieldData.name,
        type: fieldData.type,
        options: fieldData.options ? fieldData.options.join(', ') : '',
        value: Array.isArray(fieldData.value) ? fieldData.value.join(', ') : fieldData.value || '',
        mandatory: fieldData.mandatory || false,
      },
    }));
  };

  const deleteField = (section, subHeaderName, fieldName, level, subSubHeaderName = null) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSubSections = prev[section][subKey].map((sub) => {
        if (sub.name !== subHeaderName) return sub;

        if (level === 'subHeader') {
          return {
            ...sub,
            fields: sub.fields.filter((field) => field.name !== fieldName),
          };
        } else if (level === 'subSubHeader') {
          return {
            ...sub,
            [subSubKey]: sub[subSubKey].map((subSub) =>
              subSub.name === subSubHeaderName
                ? { ...subSub, fields: subSub.fields.filter((field) => field.name !== fieldName) }
                : subSub
            ),
          };
        }
        return sub;
      });
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    setEditingField(null);
    setError('');
    updatePreviews();
  };

  const handleFieldTypeChange = (section, type) => {
    setFieldInputs((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        type,
        name: type === 'score' ? 'Score' : prev[section].name,
        options: type === 'score' ? 'Pass,Fail' : prev[section].options,
        value: type === 'score' ? '' : prev[section].value,
      },
    }));
  };

  const renderSection = (section) => (
    <div>
      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
        {t(`templates.${section}`)}
      </h3>
      <div id={`${section}SubList`} className="space-y-2 mb-2">
        {structure[section][section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers'].map(
          (sub) => (
            <div key={sub.name} className="border p-2 rounded-md">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`${section}-sub-header`}
                  value={sub.name}
                  checked={selectedSubHeader[section] === sub.name}
                  onChange={() => {
                    setSelectedSubHeader((prev) => ({ ...prev, [section]: sub.name }));
                    setCurrentSubSection((prev) => ({ ...prev, [section]: sub }));
                    setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
                    setEditingSubSubHeader(null);
                    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
                    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
                  }}
                  className="mr-2"
                />
                <p className="font-semibold flex-1">{sub.name} {sub.mandatory ? <span className="text-red-500">*</span> : ''}</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => editSubSection(section, sub.name)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubSection(section, sub.name)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
              <div
                id={`${section}_${sub.name.replace(/\s/g, '_')}_sub_sub`}
                className="ml-4 space-y-2"
              >
                {(sub.fields || []).map((field) => (
                  <div key={field.name} className="border p-2 rounded-md flex items-center">
                    <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                      <div>
                        <p><strong>{t('templates.field_name')}:</strong> {field.name}</p>
                        <p><strong>{t('templates.field_type')}:</strong> {field.type === 'score' ? 'radio (score)' : field.type}</p>
                      </div>
                      <div>
                        <p><strong>{t('templates.field_options')}:</strong> {field.options?.length ? field.options.join(', ') : 'N/A'}</p>
                        <p><strong>{t('templates.field_default')}:</strong> {Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}</p>
                        <p><strong>{t('templates.field_mandatory')}:</strong> {field.mandatory || sub.mandatory ? t('common.yes') : t('common.no')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => editField(section, field.name, field, 'subHeader', sub.name)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteField(section, sub.name, field.name, 'subHeader')}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
                {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
                  (subSub) => (
                    <div key={subSub.name} className="border p-2 rounded-md">
                      <div className="flex items-center mb-2">
                        <p className="font-medium flex-1">{subSub.name} {subSub.mandatory || sub.mandatory ? <span className="text-red-500">*</span> : ''}</p>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => editSubSubSection(section, subSub.name)}
                            className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubSubSection(section, sub.name, subSub.name)}
                            className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                      <div
                        id={`${section}_${sub.name.replace(/\s/g, '_')}_${subSub.name.replace(/\s/g, '_')}_fields`}
                        className="ml-4 space-y-2"
                      >
                        {subSub.fields.map((field) => (
                          <div key={field.name} className="border p-2 rounded-md flex items-center">
                            <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                              <div>
                                <p><strong>{t('templates.field_name')}:</strong> {field.name}</p>
                                <p><strong>{t('templates.field_type')}:</strong> {field.type === 'score' ? 'radio (score)' : field.type}</p>
                              </div>
                              <div>
                                <p><strong>{t('templates.field_options')}:</strong> {field.options?.length ? field.options.join(', ') : 'N/A'}</p>
                                <p><strong>{t('templates.field_default')}:</strong> {Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}</p>
                                <p><strong>{t('templates.field_mandatory')}:</strong> {field.mandatory || subSub.mandatory || sub.mandatory ? t('common.yes') : t('common.no')}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => editField(section, field.name, field, 'subSubHeader', sub.name, subSub.name)}
                                className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                              >
                                {t('common.edit')}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteField(section, sub.name, field.name, 'subSubHeader', subSub.name)}
                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                              >
                                {t('common.delete')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t(`templates.${section}_sub_name`)}
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={subNames[section]}
            onChange={(e) => setSubNames((prev) => ({ ...prev, [section]: e.target.value }))}
            onInput={(e) => {
              const updatedSubNames = { ...subNames, [section]: e.target.value };
              updatePreviews(templateName, createdBy, updatedSubNames, subSubNames, fieldInputs, selectedReportType);
            }}
            className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t(`templates.${section}_sub_placeholder`)}
            autoFocus={editingSubHeader?.section === section}
          />
          <button
            type="button"
            onClick={() => addSubSection(section)}
            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            {editingSubHeader?.section === section ? t('common.save') : t(`templates.add_${section}_sub`)}
          </button>
          {editingSubHeader?.section === section && (
            <button
              type="button"
              onClick={() => {
                setEditingSubHeader(null);
                setSubNames((prev) => ({ ...prev, [section]: '' }));
                setSubMandatory((prev) => ({ ...prev, [section]: false }));
                updatePreviews();
              }}
              className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
        <div className="mt-2">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={subMandatory[section]}
              onChange={(e) => setSubMandatory((prev) => ({ ...prev, [section]: e.target.checked }))}
              className="mr-2"
            />
            {t('templates.sub_mandatory')}
          </label>
        </div>
      </div>
      {structure[section][section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers'].length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t(`templates.${section}_sub_sub_name`)}
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={subSubNames[section]}
              onChange={(e) => setSubSubNames((prev) => ({ ...prev, [section]: e.target.value }))}
              onInput={(e) => {
                const updatedSubSubNames = { ...subSubNames, [section]: e.target.value };
                updatePreviews(templateName, createdBy, subNames, updatedSubSubNames, fieldInputs, selectedReportType);
              }}
              className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t(`templates.${section}_sub_sub_placeholder`)}
              autoFocus={editingSubSubHeader?.section === section}
            />
            <button
              type="button"
              onClick={() => addSubSubSection(section)}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              {editingSubSubHeader?.section === section ? t('common.save') : t(`templates.add_${section}_sub_sub`)}
            </button>
            {editingSubSubHeader?.section === section && (
              <button
                type="button"
                onClick={() => {
                  setEditingSubSubHeader(null);
                  setSubSubNames((prev) => ({ ...prev, [section]: '' }));
                  setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
                  updatePreviews();
                }}
                className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
          <div className="mt-2">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={subSubMandatory[section]}
                onChange={(e) => setSubSubMandatory((prev) => ({ ...prev, [section]: e.target.checked }))}
                className="mr-2"
              />
              {t('templates.sub_sub_mandatory')}
            </label>
          </div>
        </div>
      )}
      {selectedSubHeader[section] && (
        <div>
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('templates.field_name')}
              </label>
              <input
                type="text"
                value={fieldInputs[section].name}
                onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], name: e.target.value } }))}
                onInput={(e) => {
                  const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], name: e.target.value } };
                  updatePreviews(templateName, createdBy, subNames, subSubNames, updatedFieldInputs, selectedReportType);
                }}
                className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder={t(`templates.${section}_field_name_placeholder`)}
                disabled={fieldInputs[section].type === 'score'}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('templates.field_type')}
              </label>
              <select
                value={fieldInputs[section].type}
                onChange={(e) => handleFieldTypeChange(section, e.target.value)}
                className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="text">{t('templates.type_text')}</option>
                <option value="checkbox">{t('templates.type_checkbox')}</option>
                <option value="array">{t('templates.type_array')}</option>
                <option value="dropdown">{t('templates.type_dropdown')}</option>
                <option value="image">{t('templates.type_image')}</option>
                <option value="multi_image">{t('templates.type_multi_image')}</option>
                <option value="PDF">{t('templates.type_pdf')}</option>
                <option value="radio">{t('templates.type_radio')}</option>
                <option value="Date">{t('templates.type_date')}</option>
                <option value="DateTime">{t('templates.type_datetime')}</option>
                <option value="Time">{t('templates.type_time')}</option>
                <option value="score">{t('templates.type_score')}</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('templates.field_options')}
            </label>
            <input
              type="text"
              value={fieldInputs[section].options}
              onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], options: e.target.value } }))}
              onInput={(e) => {
                const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], options: e.target.value } };
                updatePreviews(templateName, createdBy, subNames, subSubNames, updatedFieldInputs, selectedReportType);
              }}
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t('templates.field_options_placeholder')}
              disabled={fieldInputs[section].type === 'image' || fieldInputs[section].type === 'multi_image' || fieldInputs[section].type === 'PDF' || fieldInputs[section].type === 'Date' || fieldInputs[section].type === 'DateTime' || fieldInputs[section].type === 'Time' || fieldInputs[section].type === 'score'}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('templates.field_default')}
            </label>
            <input
              type="text"
              value={fieldInputs[section].value}
              onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], value: e.target.value } }))}
              onInput={(e) => {
                const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], value: e.target.value } };
                updatePreviews(templateName, createdBy, subNames, subSubNames, updatedFieldInputs, selectedReportType);
              }}
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t('templates.field_default_placeholder')}
              disabled={fieldInputs[section].type === 'image' || fieldInputs[section].type === 'multi_image' || fieldInputs[section].type === 'PDF' || fieldInputs[section].type === 'Time' || fieldInputs[section].type === 'score'}
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={fieldInputs[section].mandatory}
                onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], mandatory: e.target.checked } }))}
                className="mr-2"
              />
              {t('templates.field_mandatory')}
            </label>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => addField(section)}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              {editingField?.section === section ? t('common.save') : t('templates.add_field')}
            </button>
            {editingField?.section === section && (
              <button
                type="button"
                onClick={() => {
                  setEditingField(null);
                  setFieldInputs((prev) => ({ ...prev, [section]: { name: '', type: 'text', options: '', value: '', mandatory: false } }));
                  updatePreviews();
                }}
                className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('templates.report_type')}
        </label>
        <select
          value={selectedReportType}
          onChange={(e) => {
            setSelectedReportType(e.target.value);
            updatePreviews(templateName, createdBy, subNames, subSubNames, fieldInputs, e.target.value);
          }}
          className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          required
        >
          <option value="">{t('templates.select_report_type')}</option>
          {reportNames.map((report) => (
            <option key={report._id} value={report.name}>
              {report.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('templates.template_name')}
        </label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => {
            setTemplateName(e.target.value);
            updatePreviews(e.target.value, createdBy, subNames, subSubNames, fieldInputs, selectedReportType);
          }}
          className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('templates.created_by')}
        </label>
        <input
          type="text"
          value={createdBy}
          onChange={(e) => {
            setCreatedBy(e.target.value);
            updatePreviews(templateName, e.target.value, subNames, subSubNames, fieldInputs, selectedReportType);
          }}
          className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          required
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('templates.select_section')}
        </label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          <option value="header">{t('templates.header')}</option>
          <option value="body">{t('templates.body')}</option>
          <option value="footer">{t('templates.footer')}</option>
        </select>
      </div>
      {renderSection(selectedSection)}
      <button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
      >
        {t('templates.save_template')}
      </button>
      {templateResult && (
        <div className="mt-4 text-sm text-green-600">{templateResult}</div>
      )}
    </form>
  );
};

export default ManualTemplateCreator;