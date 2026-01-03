import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import schemaCreatorService from '../../lib/schemaCreatorService';

// TODO: Consider adding an error boundary around this component to handle rendering errors gracefully.
// See https://react.dev/link/error-boundaries for details.

const SchemaCreator = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [schemaName, setSchemaName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [selectedSchemaType, setSelectedSchemaType] = useState('');
  const [schemaTypes, setSchemaTypes] = useState([]); // Initialize as empty array
  const [primaryStructure, setPrimaryStructure] = useState({
    schema: { fields: [] },
  });
  const [relatedSchema, setRelatedSchema] = useState(null); // Null or { name, schema: { fields: [] } }
  const [fieldInputs, setFieldInputs] = useState({
    primary: { name: '', type: 'text', options: '', value: '' },
    related: { name: '', type: 'text', options: '', value: '' },
  });
  const [schemaResult, setSchemaResult] = useState('');
  const [editingField, setEditingField] = useState(null); // { type: 'primary' | 'related', fieldName }
  const [checkboxStates, setCheckboxStates] = useState({});
  const [isRelatedSchemaActive, setIsRelatedSchemaActive] = useState(false);
  const [relationshipField, setRelationshipField] = useState({
    name: '',
    type: 'dropdown',
    options: '',
    value: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.25:5055';

  useEffect(() => {
    console.log('SchemaCreator: useEffect running with:', { authLoading, authData });
    if (authLoading) return;

    if (!authData?.access_token) {
      console.log('SchemaCreator: No access token, redirecting to /dashboard');
      setError(t('schemas.no_permission'));
      navigate('/dashboard');
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      console.log('SchemaCreator: Privilege 1 found, setting hasPrivilege');
      setHasPrivilege(true);
      setCreatedBy(authData.user_id || 'user_001');

      // Fetch schema types
      const fetchSchemaTypes = async () => {
        try {
          const response = await fetch(`${API_URL}/api/schemas/schema_types`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': authData.access_token,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch schema types: ${response.status}`);
          }

          const data = await response.json();
          setSchemaTypes(Array.isArray(data) ? data : []);
          console.log('SchemaCreator: Fetched schema types:', data);
        } catch (err) {
          console.error('SchemaCreator: Error fetching schema types:', err);
          setError(t('schemas.fetch_schema_types_error', { message: err.message }));
          setSchemaTypes([]); // Ensure schemaTypes is an array
        }
      };

      fetchSchemaTypes();
      setLoading(false);
      console.log('SchemaCreator: Set loading to false (has privilege)');
    } else {
      console.log('SchemaCreator: Privilege 1 not found, redirecting to /dashboard');
      setError(t('schemas.no_permission'));
      navigate('/dashboard');
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t, navigate]);

  const handleAddRelatedSchema = () => {
    if (!schemaName) {
      setError(t('schemas.enter_primary_schema_name'));
      return;
    }
    setIsRelatedSchemaActive(true);
    setRelatedSchema({ name: '', schema: { fields: [] } });
    setError('');
  };

  const addField = (type) => {
    if (!hasPrivilege) {
      setError(t('schemas.no_permission'));
      return;
    }

    const inputs = fieldInputs[type];
    if (!inputs.name) {
      setError(t('schemas.enter_field_name'));
      return;
    }

    const newField = {
      name: inputs.name,
      type: inputs.type,
      options:
        inputs.type === 'image' || inputs.type === 'multi_image'
          ? []
          : inputs.options
          ? inputs.options.split(',').map((s) => s.trim())
          : [],
      value:
        inputs.type === 'image' || inputs.type === 'dropdown'
          ? ''
          : inputs.type === 'multi_image' || inputs.type === 'checkbox' || inputs.type === 'array'
          ? []
          : inputs.value || '',
    };

    if (type === 'primary') {
      setPrimaryStructure((prev) => {
        if (editingField && editingField.type === 'primary') {
          return {
            ...prev,
            schema: {
              ...prev.schema,
              fields: prev.schema.fields.map((field) =>
                field.name === editingField.fieldName ? newField : field
              ),
            },
          };
        }
        return {
          ...prev,
          schema: {
            ...prev.schema,
            fields: [...(prev.schema.fields || []), newField],
          },
        };
      });
    } else {
      setRelatedSchema((prev) => ({
        ...prev,
        schema: {
          ...prev.schema,
          fields: editingField && editingField.type === 'related' && prev.schema.fields
            ? prev.schema.fields.map((field) =>
                field.name === editingField.fieldName ? newField : field
              )
            : [...(prev.schema.fields || []), newField],
        },
      }));
    }

    setFieldInputs((prev) => ({
      ...prev,
      [type]: { name: '', type: 'text', options: '', value: '' },
    }));
    setEditingField(null);
    setError('');
    updatePreviews();
  };

  const editField = (type, fieldName, fieldData) => {
    if (!hasPrivilege) {
      setError(t('schemas.no_permission'));
      return;
    }
    setEditingField({ type, fieldName });
    setFieldInputs((prev) => ({ ...prev, [type]: fieldData }));
  };

  const deleteField = (type, fieldName) => {
    if (!hasPrivilege) {
      setError(t('schemas.no_permission'));
      return;
    }
    if (type === 'primary') {
      setPrimaryStructure((prev) => ({
        ...prev,
        schema: {
          ...prev.schema,
          fields: prev.schema.fields.filter((field) => field.name !== fieldName),
        },
      }));
    } else {
      setRelatedSchema((prev) => ({
        ...prev,
        schema: {
          ...prev.schema,
          fields: prev.schema.fields.filter((field) => field.name !== fieldName),
        },
      }));
    }
    setError('');
    updatePreviews();
  };

  const addRelationshipField = () => {
    if (!hasPrivilege) {
      setError(t('schemas.no_permission'));
      return;
    }
    if (!relationshipField.name) {
      setError(t('schemas.enter_relationship_field_name'));
      return;
    }
    if (!relatedSchema?.name) {
      setError(t('schemas.enter_related_schema_name'));
      return;
    }

    const newField = {
      name: relationshipField.name,
      type: relationshipField.type,
      options: relationshipField.options
        ? relationshipField.options.split(',').map((s) => s.trim())
        : [relatedSchema.name],
      value: '',
    };

    setPrimaryStructure((prev) => ({
      ...prev,
      schema: {
        ...prev.schema,
        fields: [...(prev.schema.fields || []), newField],
      },
    }));
    setRelationshipField({ name: '', type: 'dropdown', options: '', value: '' });
    setError('');
    updatePreviews();
  };

  const updatePreviews = (
    overrideSchemaName = schemaName,
    overrideCreatedBy = createdBy,
    overrideFieldInputs = fieldInputs,
    overrideSchemaType = selectedSchemaType,
    overrideRelatedSchema = relatedSchema
  ) => {
    console.log('SchemaCreator: Updating previews with:', {
      overrideSchemaName,
      overrideCreatedBy,
      overrideSchemaType,
      schemaTypesLength: schemaTypes.length,
    });
    try {
      const primarySchema = {
        schemaType: overrideSchemaType || '',
        name: overrideSchemaName || 'Unnamed Schema',
        description: 'Dynamic schema',
        created_by: overrideCreatedBy || 'Unknown User',
        created_at: new Date().toISOString(),
        structure: primaryStructure,
      };

      let previewSchemas = [primarySchema];
      if (overrideRelatedSchema && overrideRelatedSchema.name) {
        const related = {
          schemaType: overrideSchemaType || '',
          name: overrideRelatedSchema.name || 'Unnamed Related Schema',
          description: 'Dynamic related schema',
          created_by: overrideCreatedBy || 'Unknown User',
          created_at: new Date().toISOString(),
          structure: overrideRelatedSchema.schema,
        };
        previewSchemas.push(related);
      }

      document.getElementById('schemaPreview').textContent = JSON.stringify(previewSchemas, null, 2);

      const uiFieldsContainer = document.getElementById('userUISchemaFields');
      if (uiFieldsContainer) {
        uiFieldsContainer.innerHTML = '';

        // Primary Schema
        const primaryDiv = document.createElement('div');
        primaryDiv.className = 'mb-4';
        primaryDiv.innerHTML = `<h4 class="text-md font-medium mb-2">${overrideSchemaName || 'Primary Schema'}</h4>`;

        const primaryFieldsDiv = document.createElement('div');
        primaryFieldsDiv.className = 'space-y-2';
        primaryStructure.schema.fields.forEach((field) => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
          if (field.type === 'text') {
            fieldDiv.innerHTML = `
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly>
              </div>
            `;
          } else if (field.type === 'checkbox' || field.type === 'array') {
            fieldDiv.innerHTML = `
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                <div class="mt-1 flex flex-wrap gap-2">
                  ${field.options
                    .map(
                      (opt) => {
                        const fieldId = `primary_${field.name}_${opt}`;
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
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
                  <option value="">${t('schemas.select_option')}</option>
                  ${field.options.map((opt) => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
              </div>
            `;
          } else if (field.type === 'image') {
            fieldDiv.innerHTML = `
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                  ${t('schemas.image_upload_placeholder')}
                </div>
              </div>
            `;
          } else if (field.type === 'multi_image') {
            fieldDiv.innerHTML = `
              <div class="col-span-1">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                  ${t('schemas.multi_image_upload_placeholder')}
                </div>
              </div>
            `;
          }
          primaryFieldsDiv.appendChild(fieldDiv);
        });
        primaryDiv.appendChild(primaryFieldsDiv);
        uiFieldsContainer.appendChild(primaryDiv);

        // Related Schema
        if (overrideRelatedSchema && overrideRelatedSchema.name) {
          const relatedDiv = document.createElement('div');
          relatedDiv.className = 'mb-4';
          relatedDiv.innerHTML = `<h4 class="text-md font-medium mb-2">${overrideRelatedSchema.name || 'Related Schema'}</h4>`;

          const relatedFieldsDiv = document.createElement('div');
          relatedFieldsDiv.className = 'space-y-2';
          overrideRelatedSchema.schema.fields.forEach((field) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
            if (field.type === 'text') {
              fieldDiv.innerHTML = `
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                  <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly>
                </div>
              `;
            } else if (field.type === 'checkbox' || field.type === 'array') {
              fieldDiv.innerHTML = `
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                  <div class="mt-1 flex flex-wrap gap-2">
                    ${field.options
                      .map(
                        (opt) => {
                          const fieldId = `related_${field.name}_${opt}`;
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
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                  <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
                    <option value="">${t('schemas.select_option')}</option>
                    ${field.options.map((opt) => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                  </select>
                </div>
              `;
            } else if (field.type === 'image') {
              fieldDiv.innerHTML = `
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                  <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                    ${t('schemas.image_upload_placeholder')}
                  </div>
                </div>
              `;
            } else if (field.type === 'multi_image') {
              fieldDiv.innerHTML = `
                <div class="col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
                  <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                    ${t('schemas.multi_image_upload_placeholder')}
                  </div>
                </div>
              `;
            }
            relatedFieldsDiv.appendChild(fieldDiv);
          });
          relatedDiv.appendChild(relatedFieldsDiv);
          uiFieldsContainer.appendChild(relatedDiv);
        }
      }

      window.updateCheckboxState = (fieldId, isChecked) => {
        setCheckboxStates((prev) => ({ ...prev, [fieldId]: isChecked }));
      };
      console.log('SchemaCreator: Previews updated successfully');
    } catch (err) {
      setError(t('schemas.preview_error'));
      document.getElementById('schemaPreview').textContent = `Error: ${err.message}`;
      console.error('SchemaCreator: Error updating previews:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('schemas.no_permission'));
      return;
    }
    if (!selectedSchemaType) {
      setError(t('schemas.select_schema_type'));
      return;
    }
    if (!schemaName) {
      setError(t('schemas.enter_schema_name'));
      return;
    }
    if (!primaryStructure.schema.fields.length) {
      setError(t('schemas.add_field'));
      return;
    }
    if (isRelatedSchemaActive && (!relatedSchema?.name || !relatedSchema.schema.fields.length)) {
      setError(t('schemas.complete_related_schema'));
      return;
    }

    const primarySchema = {
      schemaType: selectedSchemaType,
      name: schemaName,
      description: 'Dynamic schema',
      created_by: createdBy,
      created_at: new Date().toISOString(),
      structure: primaryStructure,
    };

    try {
      let results = [];
      console.log('SchemaCreator: Submitting primary schema:', primarySchema);
      // Save primary schema
      const primaryResult = await schemaCreatorService.createSchema(primarySchema, authData.org_id);
      if (!primaryResult.insertedId) {
        throw new Error('No insertedId returned for primary schema');
      }
      results.push(t('schemas.created_success', { id: primaryResult.insertedId }));

      // Save related schema if exists
      if (isRelatedSchemaActive && relatedSchema?.name) {
        const relatedSchemaData = {
          schemaType: selectedSchemaType,
          name: relatedSchema.name,
          description: 'Dynamic related schema',
          created_by: createdBy,
          created_at: new Date().toISOString(),
          structure: relatedSchema.schema,
        };
        console.log('SchemaCreator: Submitting related schema:', relatedSchemaData);
        const relatedResult = await schemaCreatorService.createSchema(relatedSchemaData, authData.org_id);
        if (!relatedResult.insertedId) {
          throw new Error('No insertedId returned for related schema');
        }
        results.push(t('schemas.created_success', { id: relatedResult.insertedId }));
      }

      setSchemaResult(results.join(' | '));
      setError('');
      // Reset form
      setSelectedSchemaType('');
      setSchemaName('');
      setPrimaryStructure({ schema: { fields: [] } });
      setRelatedSchema(null);
      setIsRelatedSchemaActive(false);
      setFieldInputs({
        primary: { name: '', type: 'text', options: '', value: '' },
        related: { name: '', type: 'text', options: '', value: '' },
      });
      setRelationshipField({ name: '', type: 'dropdown', options: '', value: '' });
      setEditingField(null);
      setCheckboxStates({});
      updatePreviews();
      console.log('SchemaCreator: Form submitted successfully:', results);
    } catch (err) {
      setError(t('schemas.create_error', { message: err.message }));
      setSchemaResult('');
      console.error('SchemaCreator: Error submitting form:', err);
    }
  };

  const renderSchemaSection = (type) => {
    console.log('SchemaCreator: Rendering schema section:', type);
    const isPrimary = type === 'primary';
    const structure = isPrimary ? primaryStructure : relatedSchema?.schema;
    const title = isPrimary ? schemaName || 'Primary Schema' : relatedSchema?.name || 'Related Schema';
    if (!isPrimary && !isRelatedSchemaActive) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
          {isPrimary ? t('schemas.primary_schema') : t('schemas.related_schema')}
        </h3>
        {!isPrimary && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('schemas.related_schema_name')}
            </label>
            <input
              type="text"
              value={relatedSchema?.name || ''}
              onChange={(e) =>
                setRelatedSchema((prev) => ({ ...prev, name: e.target.value }))
              }
              onInput={(e) => updatePreviews(schemaName, createdBy, fieldInputs, selectedSchemaType, { ...relatedSchema, name: e.target.value })}
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t('schemas.related_schema_name_placeholder')}
            />
          </div>
        )}
        <div id={`${type}FieldsList`} className="space-y-2 mb-2">
          {structure?.fields?.map((field) => (
            <div key={field.name} className="border p-2 rounded-md flex items-center">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <p>
                    <strong>{t('schemas.field_name')}:</strong> {field.name}
                  </p>
                  <p>
                    <strong>{t('schemas.field_type')}:</strong> {field.type}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>{t('schemas.field_options')}:</strong>{' '}
                    {field.options.length ? field.options.join(', ') : 'N/A'}
                  </p>
                  <p>
                    <strong>{t('schemas.field_default')}:</strong>{' '}
                    {Array.isArray(field.value) ? field.value.join(', ') : field.value}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => editField(type, field.name, field)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => deleteField(type, field.name)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('schemas.field_name')}
              </label>
              <input
                type="text"
                value={fieldInputs[type].name}
                onChange={(e) =>
                  setFieldInputs((prev) => ({
                    ...prev,
                    [type]: { ...prev[type], name: e.target.value },
                  }))
                }
                onInput={(e) => {
                  const updatedFieldInputs = {
                    ...fieldInputs,
                    [type]: { ...fieldInputs[type], name: e.target.value },
                  };
                  updatePreviews(schemaName, createdBy, updatedFieldInputs, selectedSchemaType, relatedSchema);
                }}
                className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder={t('schemas.field_name_placeholder')}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('schemas.field_type')}
              </label>
              <select
                value={fieldInputs[type].type}
                onChange={(e) =>
                  setFieldInputs((prev) => ({
                    ...prev,
                    [type]: { ...prev[type], type: e.target.value },
                  }))
                }
                className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="text">{t('schemas.type_text')}</option>
                <option value="checkbox">{t('schemas.type_checkbox')}</option>
                <option value="array">{t('schemas.type_array')}</option>
                <option value="dropdown">{t('schemas.type_dropdown')}</option>
                <option value="image">{t('schemas.type_image')}</option>
                <option value="multi_image">{t('schemas.type_multi_image')}</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('schemas.field_options')}
            </label>
            <input
              type="text"
              value={fieldInputs[type].options}
              onChange={(e) =>
                setFieldInputs((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], options: e.target.value },
                }))
              }
              onInput={(e) => {
                const updatedFieldInputs = {
                  ...fieldInputs,
                  [type]: { ...fieldInputs[type], options: e.target.value },
                };
                updatePreviews(schemaName, createdBy, updatedFieldInputs, selectedSchemaType, relatedSchema);
              }}
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t('schemas.field_options_placeholder')}
              disabled={fieldInputs[type].type === 'image' || fieldInputs[type].type === 'multi_image'}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('schemas.field_default')}
            </label>
            <input
              type="text"
              value={fieldInputs[type].value}
              onChange={(e) =>
                setFieldInputs((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], value: e.target.value },
                }))
              }
              onInput={(e) => {
                const updatedFieldInputs = {
                  ...fieldInputs,
                  [type]: { ...fieldInputs[type], value: e.target.value },
                };
                updatePreviews(schemaName, createdBy, updatedFieldInputs, selectedSchemaType, relatedSchema);
              }}
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t('schemas.field_default_placeholder')}
              disabled={fieldInputs[type].type === 'image' || fieldInputs[type].type === 'multi_image'}
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => addField(type)}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              {editingField && editingField.type === type ? t('common.save') : t('schemas.add_field')}
            </button>
            {editingField && editingField.type === type && (
              <button
                type="button"
                onClick={() => {
                  setEditingField(null);
                  setFieldInputs((prev) => ({
                    ...prev,
                    [type]: { name: '', type: 'text', options: '', value: '' },
                  }));
                }}
                className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRelationshipFieldSection = () => {
    console.log('SchemaCreator: Rendering relationship field section:', { isRelatedSchemaActive });
    if (!isRelatedSchemaActive) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
          {t('schemas.relationship_field')}
        </h3>
        <div className="flex space-x-2 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('schemas.relationship_field_name')}
            </label>
            <input
              type="text"
              value={relationshipField.name}
              onChange={(e) =>
                setRelationshipField((prev) => ({ ...prev, name: e.target.value }))
              }
              onInput={() => updatePreviews()}
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder={t('schemas.relationship_field_name_placeholder')}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('schemas.field_type')}
            </label>
            <select
              value={relationshipField.type}
              onChange={(e) =>
                setRelationshipField((prev) => ({ ...prev, type: e.target.value }))
              }
              className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="dropdown">{t('schemas.type_dropdown')}</option>
              <option value="array">{t('schemas.type_array')}</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('schemas.relationship_field_options')}
          </label>
          <input
            type="text"
            value={relationshipField.options}
            onChange={(e) =>
              setRelationshipField((prev) => ({ ...prev, options: e.target.value }))
            }
            onInput={() => updatePreviews()}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('schemas.relationship_field_options_placeholder')}
          />
        </div>
        <button
          type="button"
          onClick={addRelationshipField}
          className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          {t('schemas.add_relationship_field')}
        </button>
      </div>
    );
  };

  if (authLoading) {
    console.log('SchemaCreator: Rendering LoadingSpinner due to authLoading');
    return <LoadingSpinner />;
  }

  console.log('SchemaCreator: Rendering main UI:', { loading, error, hasPrivilege });
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t('schemas.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch />
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

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-5/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('schemas.define_schema')}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('schemas.schema_type')}
                      </label>
                      {schemaTypes.length > 0 ? (
                        <select
                          value={selectedSchemaType}
                          onChange={(e) => {
                            setSelectedSchemaType(e.target.value);
                            updatePreviews(schemaName, createdBy, fieldInputs, e.target.value, relatedSchema);
                          }}
                          className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          required
                        >
                          <option value="">{t('schemas.select_schema_type')}</option>
                          {schemaTypes.map((schemaType) => (
                            <option key={schemaType._id} value={schemaType.name}>
                              {schemaType.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={selectedSchemaType}
                          onChange={(e) => {
                            setSelectedSchemaType(e.target.value);
                            updatePreviews(schemaName, createdBy, fieldInputs, e.target.value, relatedSchema);
                          }}
                          className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          placeholder={t('schemas.schema_type_placeholder') || 'Enter schema type'}
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('schemas.schema_name')}
                      </label>
                      <input
                        type="text"
                        value={schemaName}
                        onChange={(e) => {
                          setSchemaName(e.target.value);
                          updatePreviews(e.target.value, createdBy, fieldInputs, selectedSchemaType, relatedSchema);
                        }}
                        className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        placeholder={t('schemas.schema_name_placeholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('schemas.created_by')}
                      </label>
                      <input
                        type="text"
                        value={createdBy}
                        onChange={(e) => {
                          setCreatedBy(e.target.value);
                          updatePreviews(schemaName, e.target.value, fieldInputs, selectedSchemaType, relatedSchema);
                        }}
                        className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        required
                        readOnly
                      />
                    </div>
                    {renderSchemaSection('primary')}
                    {!isRelatedSchemaActive && (
                      <button
                        type="button"
                        onClick={handleAddRelatedSchema}
                        className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        {t('schemas.add_related_schema')}
                      </button>
                    )}
                    {renderSchemaSection('related')}
                    {renderRelationshipFieldSection()}
                    <button
                      type="submit"
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
                    >
                      {t('schemas.save_schemas')}
                    </button>
                  </form>
                  {schemaResult && (
                    <div className="mt-4 text-sm text-green-600">{schemaResult}</div>
                  )}
                </div>

                <div className="w-full lg:w-2/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('schemas.json_preview')}
                  </h2>
                  <pre
                    id="schemaPreview"
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-x-auto h-[80vh] text-xs text-gray-800 dark:text-gray-200"
                  ></pre>
                </div>

                <div className="w-full lg:w-5/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      {t('schemas.ui_preview')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => updatePreviews()}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
                    >
                      {t('common.sync_ui_preview')}
                    </button>
                  </div>
                  <div className="space-y-4 h-[80vh] overflow-auto">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                        {t('schemas.schemas')}
                      </h3>
                      <div id="userUISchemaFields" className="space-y-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SchemaCreator;