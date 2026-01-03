import React, { createContext, useState, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import templateService from '../../lib/templateService';

const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportNames, setReportNames] = useState([]);
  const [structure, setStructure] = useState({
    header: { sub_headers: [] },
    body: { sub_bodies: [] },
    footer: { sub_footers: [] },
  });
  const [currentSubSection, setCurrentSubSection] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [currentSubSubSection, setCurrentSubSubSection] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [subNames, setSubNames] = useState({
    header: '',
    body: '',
    footer: '',
  });
  const [subSubNames, setSubSubNames] = useState({
    header: '',
    body: '',
    footer: '',
  });
  const [fieldInputs, setFieldInputs] = useState({
    header: { name: '', type: 'text', options: '', value: '', mandatory: false },
    body: { name: '', type: 'text', options: '', value: '', mandatory: false },
    footer: { name: '', type: 'text', options: '', value: '', mandatory: false },
  });
  const [templateResult, setTemplateResult] = useState('');
  const [selectedSubHeader, setSelectedSubHeader] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [editingSubHeader, setEditingSubHeader] = useState(null);
  const [editingSubSubHeader, setEditingSubSubHeader] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [checkboxStates, setCheckboxStates] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  const updatePreviews = (
    overrideTemplateName = templateName,
    overrideCreatedBy = createdBy,
    overrideSubNames = subNames,
    overrideSubSubNames = subSubNames,
    overrideFieldInputs = fieldInputs,
    overrideReportType = selectedReportType
  ) => {
    try {
      const template = {
        reportType: overrideReportType || '',
        name: overrideTemplateName || 'Unnamed Template',
        description: 'Dynamic NCR template',
        created_by: overrideCreatedBy || 'Unknown User',
        created_at: new Date().toISOString(),
        structure,
      };

      document.getElementById('templatePreview').textContent = JSON.stringify(template, null, 2);

      ['header', 'body', 'footer'].forEach((section) => {
        const uiFieldsContainer = document.getElementById(`userUI${section.charAt(0).toUpperCase() + section.slice(1)}Fields`);
        if (uiFieldsContainer) {
          uiFieldsContainer.innerHTML = '';
          const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
          const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
          structure[section][subKey].forEach((subSection) => {
            const mandatoryIndicator = subSection.mandatory ? '<span class="text-red-500">*</span>' : '';
            const subDiv = document.createElement('div');
            subDiv.className = 'mb-4';
            subDiv.innerHTML = `<h4 class="text-md font-medium mb-2">${subSection.name} ${mandatoryIndicator}</h4>`;

            const subFieldsDiv = document.createElement('div');
            subFieldsDiv.className = 'space-y-2';
            (subSection.fields || []).forEach((field) => {
              const fieldMandatoryIndicator = field.mandatory ? '<span class="text-red-500">*</span>' : '';
              const fieldDiv = document.createElement('div');
              fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
              if (field.type === 'text') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              } else if (field.type === 'checkbox' || field.type === 'array') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 flex flex-wrap gap-2">
                      ${field.options
                        .map(
                          (opt) => {
                            const fieldId = `${section}_${subSection.name}_${field.name}_${opt}`;
                            const isChecked = checkboxStates[fieldId] ?? field.value.includes(opt);
                            return `
                              <label class="inline-flex items-center">
                                <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-1" onchange="window.updateCheckboxState('${fieldId}', this.checked)">
                                <span>${opt}</span>
                              </label>
                            `;
                          }
                        )
                        .join('')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'dropdown') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
                      <option value="">${t('templates.select_option')}</option>
                      ${field.options.map(opt => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                  </div>
                `;
              } else if (field.type === 'image') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                      ${t('templates.image_upload_placeholder')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'multi_image') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                      ${t('templates.multi_image_upload_placeholder')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'PDF') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                      ${t('templates.pdf_upload_placeholder')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'radio' || field.type === 'score') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 flex flex-wrap gap-2">
                      ${field.options
                        .map(
                          (opt) => {
                            const fieldId = `${section}_${subSection.name}_${field.name}_${opt}`;
                            const isChecked = field.value === opt;
                            return `
                              <label class="inline-flex items-center">
                                <input type="radio" name="${fieldId}" ${isChecked ? 'checked' : ''} class="mr-1" disabled>
                                <span>${opt}</span>
                              </label>
                            `;
                          }
                        )
                        .join('')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'Date') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="date" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              } else if (field.type === 'DateTime') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="datetime-local" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              } else if (field.type === 'Time') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="time" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              }
              subFieldsDiv.appendChild(fieldDiv);
            });
            subDiv.appendChild(subFieldsDiv);

            const subSubSections = subSection[subSubKey] || [];
            subSubSections.forEach((subSubSection) => {
              const subSubMandatoryIndicator = subSubSection.mandatory ? '<span class="text-red-500">*</span>' : '';
              const subSubDiv = document.createElement('div');
              subSubDiv.className = 'ml-4 mb-3';
              subSubDiv.innerHTML = `<h5 class="text-sm font-medium mb-2">${subSubSection.name} ${subSubMandatoryIndicator}</h5>`;
              const fieldsDiv = document.createElement('div');
              fieldsDiv.className = 'space-y-2';
              subSubSection.fields.forEach((field) => {
                const fieldMandatoryIndicator = field.mandatory ? '<span class="text-red-500">*</span>' : '';
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
                if (field.type === 'text') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                } else if (field.type === 'checkbox' || field.type === 'array') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 flex flex-wrap gap-2">
                        ${field.options
                          .map(
                            (opt) => {
                              const fieldId = `${section}_${subSection.name}_${subSubSection.name}_${field.name}_${opt}`;
                              const isChecked = checkboxStates[fieldId] ?? field.value.includes(opt);
                              return `
                                <label class="inline-flex items-center">
                                  <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-1" onchange="window.updateCheckboxState('${fieldId}', this.checked)">
                                  <span>${opt}</span>
                                </label>
                              `;
                            }
                          )
                          .join('')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'dropdown') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
                        <option value="">${t('templates.select_option')}</option>
                        ${field.options.map(opt => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                      </select>
                    </div>
                  `;
                } else if (field.type === 'image') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                        ${t('templates.image_upload_placeholder')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'multi_image') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                        ${t('templates.multi_image_upload_placeholder')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'PDF') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                        ${t('templates.pdf_upload_placeholder')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'radio' || field.type === 'score') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 flex flex-wrap gap-2">
                        ${field.options
                          .map(
                            (opt) => {
                              const fieldId = `${section}_${subSection.name}_${subSubSection.name}_${field.name}_${opt}`;
                              const isChecked = field.value === opt;
                              return `
                                <label class="inline-flex items-center">
                                  <input type="radio" name="${fieldId}" ${isChecked ? 'checked' : ''} class="mr-1" disabled>
                                  <span>${opt}</span>
                                </label>
                              `;
                            }
                          )
                          .join('')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'Date') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="date" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                } else if (field.type === 'DateTime') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="datetime-local" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                } else if (field.type === 'Time') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="time" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                }
                fieldsDiv.appendChild(fieldDiv);
              });
              subSubDiv.appendChild(fieldsDiv);
              subDiv.appendChild(subSubDiv);
            });
            uiFieldsContainer.appendChild(subDiv);
          });
        }
      });

      window.updateCheckboxState = (fieldId, isChecked) => {
        setCheckboxStates((prev) => ({ ...prev, [fieldId]: isChecked }));
      };
    } catch (err) {
      setError(t('templates.preview_error'));
      document.getElementById('templatePreview').textContent = `Error: ${err.message}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    if (!selectedReportType) {
      setError(t('templates.select_report_type'));
      return;
    }
    if (!templateName.trim()) {
      setError(t('templates.enter_template_name'));
      return;
    }
    if (!structure.header.sub_headers.length && !structure.body.sub_bodies.length && !structure.footer.sub_footers.length) {
      setError(t('templates.add_sub_section'));
      return;
    }

    const template = {
      reportType: selectedReportType,
      name: templateName.trim(),
      description: 'Dynamic NCR template',
      created_by: createdBy,
      created_at: new Date().toISOString(),
      structure,
    };

    try {
      const result = await templateService.createTemplate(template, authData.org_id);
      if (!result.insertedId) {
        throw new Error('No insertedId returned from server');
      }
      setTemplateResult(t('templates.created_success', { id: result.insertedId }));
      setError('');
      setSelectedReportType('');
      setTemplateName('');
      setStructure({ header: { sub_headers: [] }, body: { sub_bodies: [] }, footer: { sub_footers: [] } });
      setCurrentSubSection({ header: null, body: null, footer: null });
      setCurrentSubSubSection({ header: null, body: null, footer: null });
      setSubNames({ header: '', body: '', footer: '' });
      setSubSubNames({ header: '', body: '', footer: '' });
      setFieldInputs({
        header: { name: '', type: 'text', options: '', value: '', mandatory: false },
        body: { name: '', type: 'text', options: '', value: '', mandatory: false },
        footer: { name: '', type: 'text', options: '', value: '', mandatory: false },
      });
      setSelectedSubHeader({ header: null, body: null, footer: null });
      setEditingSubHeader(null);
      setEditingSubSubHeader(null);
      setEditingField(null);
      setCheckboxStates({});
      updatePreviews();
    } catch (err) {
      setError(t('templates.create_error', { message: err.message }));
      setTemplateResult('');
    }
  };

  return (
    <TemplateContext.Provider
      value={{
        authData,
        authLoading,
        language,
        t,
        hasPrivilege,
        setHasPrivilege,
        error,
        setError,
        loading,
        setLoading,
        templateName,
        setTemplateName,
        createdBy,
        setCreatedBy,
        selectedReportType,
        setSelectedReportType,
        reportNames,
        setReportNames,
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
        templateResult,
        setTemplateResult,
        selectedSubHeader,
        setSelectedSubHeader,
        editingSubHeader,
        setEditingSubHeader,
        editingSubSubHeader,
        setEditingSubSubHeader,
        editingField,
        setEditingField,
        checkboxStates,
        setCheckboxStates,
        updatePreviews,
        handleSubmit,
        API_URL,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => useContext(TemplateContext);