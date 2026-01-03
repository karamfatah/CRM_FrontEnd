// import React, { useState } from 'react';
// import { useTemplate } from './TemplateContext';

// const AITemplateCreator = () => {
//   const {
//     t,
//     hasPrivilege,
//     setError,
//     templateName,
//     setTemplateName,
//     createdBy,
//     structure,
//     setStructure,
//     selectedReportType,
//     setSelectedReportType,
//     currentSubSection,
//     setCurrentSubSection,
//     currentSubSubSection,
//     setCurrentSubSubSection,
//     subNames,
//     setSubNames,
//     subSubNames,
//     setSubSubNames,
//     fieldInputs,
//     setFieldInputs,
//     selectedSubHeader,
//     setSelectedSubHeader,
//     editingSubHeader,
//     setEditingSubHeader,
//     editingSubSubHeader,
//     setEditingSubSubHeader,
//     editingField,
//     setEditingField,
//     checkboxStates,
//     setCheckboxStates,
//     templateResult,
//     updatePreviews,
//     handleSubmit,
//     API_URL,
//     authData,
//   } = useTemplate();
//   const [aiQuestions, setAiQuestions] = useState({
//     businessType: '',
//     businessDescription: '',
//     headerNeeds: '',
//     bodyNeeds: '',
//     footerNeeds: '',
//     criticalFields: '',
//     complianceRequirements: '',
//   });
//   const [aiLoading, setAiLoading] = useState(false);

//   const handleAiSubmit = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     setAiLoading(true);
//     setError('');

//     try {
//       const prompt = `
//         Generate a structured template for a Non-Conformity Report (NCR) in JSON format, tailored to the user's business needs and compliance requirements. The template must include a name, description, created_by, created_at, and a structure object with header, body, and footer sections. Each section must contain:

//         - **Sub-sections** (sub_headers, sub_bodies, sub_footers): At least one sub-section per section, each with a unique name and an array of fields (name, type, options, value). Field types can be 'text', 'checkbox', 'array', 'dropdown', 'image', 'multi_image', 'PDF', 'radio', 'Date', 'DateTime', or 'Time'. Checkbox, array, and radio fields must include an options array with at least two choices and an empty value array for checkbox/array or a single value for radio. PDF, Date, DateTime, and Time fields should have empty options arrays and appropriate default values (e.g., empty string for PDF/Time, empty string or ISO date for Date/DateTime). Dropdown fields should have a single value or empty string.
//         - **Sub-sub-sections** (sub_sub_headers, sub_sub_bodies, sub_sub_footers): Each sub-section must include at least one sub-sub-section with a unique name and its own array of fields, following the same field structure as above.
//         - **Fields**: Ensure fields are practical and relevant to the business type and compliance requirements. Include a mix of text, checkbox, array, dropdown, image, multi_image, PDF, radio, Date, DateTime, and Time fields. For example, a manufacturing business might include fields like "Defect Type" (radio with options ["Material", "Process", "Equipment"]), "Incident Date" (Date), "Report PDF" (PDF), "Inspection Time" (Time), or "Inspection DateTime" (DateTime).

//         Use the following user inputs to customize the template. If details are vague or missing, make reasonable assumptions based on the business type and compliance needs, ensuring the structure is deep and practical.

//         Business Type: ${aiQuestions.businessType}
//         Business Description: ${aiQuestions.businessDescription}
//         Header Needs: ${aiQuestions.headerNeeds}
//         Body Needs: ${aiQuestions.bodyNeeds}
//         Footer Needs: ${aiQuestions.footerNeeds}
//         Critical Fields: ${aiQuestions.criticalFields}
//         Compliance Requirements: ${aiQuestions.complianceRequirements}

//         The output must strictly follow this JSON structure, with at least one sub-section and one sub-sub-section per section, each containing at least one field:
//         {
//           "name": "Generated NCR Template",
//           "description": "Dynamic NCR template for ${aiQuestions.businessType || 'general use'}",
//           "created_by": "${createdBy}",
//           "created_at": "${new Date().toISOString()}",
//           "structure": {
//             "header": {
//               "sub_headers": [
//                 {
//                   "name": "Example Header",
//                   "fields": [
//                     {"name": "Report ID", "type": "text", "options": [], "value": ""},
//                     {"name": "Status", "type": "radio", "options": ["Open", "Closed"], "value": ""}
//                   ],
//                   "sub_sub_headers": [
//                     {
//                       "name": "Header Details",
//                       "fields": [
//                         {"name": "Submission Date", "type": "Date", "options": [], "value": ""},
//                         {"name": "Submission Time", "type": "Time", "options": [], "value": ""}
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             },
//             "body": {
//               "sub_bodies": [
//                 {
//                   "name": "Incident Details",
//                   "fields": [
//                     {"name": "Description", "type": "text", "options": [], "value": ""},
//                     {"name": "Severity", "type": "array", "options": ["Critical", "Major", "Minor"], "value": []}
//                   ],
//                   "sub_sub_bodies": [
//                     {
//                       "name": "Root Cause",
//                       "fields": [
//                         {"name": "Cause Category", "type": "radio", "options": ["Human Error", "Equipment Failure"], "value": ""}
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             },
//             "footer": {
//               "sub_footers": [
//                 {
//                   "name": "Approval Section",
//                   "fields": [
//                     {"name": "Approver Name", "type": "text", "options": [], "value": ""},
//                     {"name": "Report PDF", "type": "PDF", "options": [], "value": ""}
//                   ],
//                   "sub_sub_footers": [
//                     {
//                       "name": "Final Approval",
//                       "fields": [
//                         {"name": "Approval DateTime", "type": "DateTime", "options": [], "value": ""}
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             }
//           }
//         }

//         Ensure the generated template is valid JSON, matches the user's needs, and includes nested sub-sub-sections with relevant fields.
//       `;

//       const response = await fetch(`${API_URL}/api/openai/generate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': authData.access_token,
//         },
//         body: JSON.stringify({ prompt }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `API request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       if (!data || !data.text) {
//         throw new Error('Invalid API response: Missing data or text field');
//       }

//       console.log('Raw API response text:', data.text.substring(0, 2000));
//       let generatedTemplate;
//       try {
//         generatedTemplate = JSON.parse(data.text);
//       } catch (parseError) {
//         console.error('JSON parsing error:', parseError);
//         throw new Error(
//           `AI Parsing Failed. Try Again Later or Use Manual Service. Details: ${parseError.message} at line ${parseError.lineNumber || 'unknown'}, column ${parseError.columnNumber || 'unknown'}. Raw response: ${data.text.substring(0, 100)}...`
//         );
//       }

//       if (!generatedTemplate.name || !generatedTemplate.structure) {
//         throw new Error('Generated template is missing required fields (name or structure)');
//       }

//       setTemplateName(generatedTemplate.name);
//       setStructure(generatedTemplate.structure);
//       setSelectedReportType('');
//       setCurrentSubSection({ header: null, body: null, footer: null });
//       setCurrentSubSubSection({ header: null, body: null, footer: null });
//       setSubNames({ header: '', body: '', footer: '' });
//       setSubSubNames({ header: '', body: '', footer: '' });
//       setFieldInputs({
//         header: { name: '', type: 'text', options: '', value: '' },
//         body: { name: '', type: 'text', options: '', value: '' },
//         footer: { name: '', type: 'text', options: '', value: '' },
//       });
//       setSelectedSubHeader({ header: null, body: null, footer: null });
//       setEditingSubHeader(null);
//       setEditingSubSubHeader(null);
//       setEditingField(null);
//       setCheckboxStates({});
//       updatePreviews(generatedTemplate.name, createdBy);
//     } catch (err) {
//       console.error('AI template generation error:', err);
//       setError(t('templates.ai_error', { message: err.message || 'Unknown error' }));
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const renderAiForm = () => (
//     <div className="space-y-4">
//       <form onSubmit={handleAiSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_business_type')}
//           </label>
//           <input
//             type="text"
//             value={aiQuestions.businessType}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, businessType: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_business_type_placeholder')}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_business_description')}
//           </label>
//           <textarea
//             value={aiQuestions.businessDescription}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, businessDescription: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_business_description_placeholder')}
//             rows="4"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_header_needs')}
//           </label>
//           <textarea
//             value={aiQuestions.headerNeeds}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, headerNeeds: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_header_needs_placeholder')}
//             rows="3"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_body_needs')}
//           </label>
//           <textarea
//             value={aiQuestions.bodyNeeds}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, bodyNeeds: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_body_needs_placeholder')}
//             rows="3"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_footer_needs')}
//           </label>
//           <textarea
//             value={aiQuestions.footerNeeds}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, footerNeeds: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_footer_needs_placeholder')}
//             rows="3"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_critical_fields')}
//           </label>
//           <textarea
//             value={aiQuestions.criticalFields}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, criticalFields: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_critical_fields_placeholder')}
//             rows="3"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t('templates.ai_compliance_requirements')}
//           </label>
//           <textarea
//             value={aiQuestions.complianceRequirements}
//             onChange={(e) => setAiQuestions((prev) => ({ ...prev, complianceRequirements: e.target.value }))}
//             className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//             placeholder={t('templates.ai_compliance_requirements_placeholder')}
//             rows="3"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={aiLoading}
//           className={`w-full p-2 rounded-md transition duration-200 ${
//             aiLoading
//               ? 'bg-gray-400 cursor-not-allowed'
//               : 'bg-indigo-500 hover:bg-indigo-600 text-white'
//           }`}
//         >
//           {aiLoading ? t('templates.ai_generating') : t('templates.ai_generate_template')}
//         </button>
//       </form>
//       {templateResult && (
//         <div className="mt-4">
//           <div className="text-sm text-green-600 mb-2">{templateResult}</div>
//           <button
//             onClick={handleSubmit}
//             className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
//           >
//             {t('templates.save_template')}
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   return renderAiForm();
// };

// export default AITemplateCreator;




import React, { useState } from 'react';
import { useTemplate } from './TemplateContext';

const AITemplateCreator = () => {
  const {
    t,
    hasPrivilege,
    setError,
    templateName,
    setTemplateName,
    createdBy,
    structure,
    setStructure,
    selectedReportType,
    setSelectedReportType,
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
    checkboxStates,
    setCheckboxStates,
    templateResult,
    updatePreviews,
    handleSubmit,
    API_URL,
    authData,
  } = useTemplate();
  const [aiQuestions, setAiQuestions] = useState({
    businessType: '',
    businessDescription: '',
    headerNeeds: '',
    bodyNeeds: '',
    footerNeeds: '',
    criticalFields: '',
    complianceRequirements: '',
  });
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setAiLoading(true);
    setError('');

    try {
      const prompt = `
        Generate a structured template for a Non-Conformity Report (NCR) in JSON format, tailored to the user's business needs and compliance requirements. The template must include a name, description, created_by, created_at, and a structure object with header, body, and footer sections. Each section must contain:

        - **Sub-sections** (sub_headers, sub_bodies, sub_footers): At least one sub-section per section, each with a unique name, a mandatory boolean (indicating if all fields within are required), and an array of fields (name, type, options, value, mandatory). Sub-sections listed in Critical Fields or Compliance Requirements should have mandatory: true; otherwise, set mandatory: false.
        - **Sub-sub-sections** (sub_sub_headers, sub_sub_bodies, sub_sub_footers): Each sub-section must include at least one sub-sub-section with a unique name, a mandatory boolean, and its own array of fields, following the same field structure as above. Sub-sub-sections listed in Critical Fields or Compliance Requirements should have mandatory: true; otherwise, set mandatory: false.
        - **Fields**: Ensure fields are practical and relevant to the business type and compliance requirements. Include a mix of text, checkbox, array, dropdown, image, multi_image, PDF, radio, Date, DateTime, Time, and score fields. The 'score' type is a radio field named "Score" with options ["Pass", "Fail"]. Field types can be 'text', 'checkbox', 'array', 'dropdown', 'image', 'multi_image', 'PDF', 'radio', 'Date', 'DateTime', 'Time', or 'score'. Checkbox, array, radio, and score fields must include an options array with at least two choices (for score, always ["Pass", "Fail"]) and an empty value array for checkbox/array or a single value for radio/score. PDF, Date, DateTime, and Time fields should have empty options arrays and appropriate default values (e.g., empty string for PDF/Time, empty string or ISO date for Date/DateTime). Dropdown fields should have a single value or empty string. The 'mandatory' boolean field indicates if the field is required (true) or optional (false). Set 'mandatory: true' for fields listed in Critical Fields or required by Compliance Requirements; otherwise, set 'mandatory: false'.

        Use the following user inputs to customize the template. If details are vague or missing, make reasonable assumptions based on the business type and compliance needs, ensuring the structure is deep and practical.

        Business Type: ${aiQuestions.businessType}
        Business Description: ${aiQuestions.businessDescription}
        Header Needs: ${aiQuestions.headerNeeds}
        Body Needs: ${aiQuestions.bodyNeeds}
        Footer Needs: ${aiQuestions.footerNeeds}
        Critical Fields: ${aiQuestions.criticalFields}
        Compliance Requirements: ${aiQuestions.complianceRequirements}

        The output must strictly follow this JSON structure, with at least one sub-section and one sub-sub-section per section, each containing at least one field:
        {
          "name": "Generated NCR Template",
          "description": "Dynamic NCR template for ${aiQuestions.businessType || 'general use'}",
          "created_by": "${createdBy}",
          "created_at": "${new Date().toISOString()}",
          "structure": {
            "header": {
              "sub_headers": [
                {
                  "name": "Example Header",
                  "mandatory": true,
                  "fields": [
                    {"name": "Report ID", "type": "text", "options": [], "value": "", "mandatory": true},
                    {"name": "Status", "type": "radio", "options": ["Open", "Closed"], "value": "", "mandatory": false},
                    {"name": "Score", "type": "score", "options": ["Pass", "Fail"], "value": "", "mandatory": true}
                  ],
                  "sub_sub_headers": [
                    {
                      "name": "Header Details",
                      "mandatory": false,
                      "fields": [
                        {"name": "Submission Date", "type": "Date", "options": [], "value": "", "mandatory": true},
                        {"name": "Submission Time", "type": "Time", "options": [], "value": "", "mandatory": false}
                      ]
                    }
                  ]
                }
              ]
            },
            "body": {
              "sub_bodies": [
                {
                  "name": "Incident Details",
                  "mandatory": true,
                  "fields": [
                    {"name": "Description", "type": "text", "options": [], "value": "", "mandatory": true},
                    {"name": "Severity", "type": "array", "options": ["Critical", "Major", "Minor"], "value": [], "mandatory": false},
                    {"name": "Score", "type": "score", "options": ["Pass", "Fail"], "value": "", "mandatory": false}
                  ],
                  "sub_sub_bodies": [
                    {
                      "name": "Root Cause",
                      "mandatory": true,
                      "fields": [
                        {"name": "Cause Category", "type": "radio", "options": ["Human Error", "Equipment Failure"], "value": "", "mandatory": true}
                      ]
                    }
                  ]
                }
              ]
            },
            "footer": {
              "sub_footers": [
                {
                  "name": "Approval Section",
                  "mandatory": true,
                  "fields": [
                    {"name": "Approver Name", "type": "text", "options": [], "value": "", "mandatory": true},
                    {"name": "Report PDF", "type": "PDF", "options": [], "value": "", "mandatory": false}
                  ],
                  "sub_sub_footers": [
                    {
                      "name": "Final Approval",
                      "mandatory": false,
                      "fields": [
                        {"name": "Approval DateTime", "type": "DateTime", "options": [], "value": "", "mandatory": true}
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }

        Ensure the generated template is valid JSON, matches the user's needs, includes nested sub-sub-sections with relevant fields, and appropriately sets the 'mandatory' property for fields, sub-sections, and sub-sub-sections based on Critical Fields and Compliance Requirements.
      `;

      const response = await fetch(`${API_URL}/api/openai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': authData.access_token,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.text) {
        throw new Error('Invalid API response: Missing data or text field');
      }

      console.log('Raw API response text:', data.text.substring(0, 2000));
      let generatedTemplate;
      try {
        generatedTemplate = JSON.parse(data.text);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(
          `AI Parsing Failed. Try Again Later or Use Manual Service. Details: ${parseError.message} at line ${parseError.lineNumber || 'unknown'}, column ${parseError.columnNumber || 'unknown'}. Raw response: ${data.text.substring(0, 100)}...`
        );
      }

      if (!generatedTemplate.name || !generatedTemplate.structure) {
        throw new Error('Generated template is missing required fields (name or structure)');
      }

      setTemplateName(generatedTemplate.name);
      setStructure(generatedTemplate.structure);
      setSelectedReportType('');
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
      updatePreviews(generatedTemplate.name, createdBy);
    } catch (err) {
      console.error('AI template generation error:', err);
      setError(t('templates.ai_error', { message: err.message || 'Unknown error' }));
    } finally {
      setAiLoading(false);
    }
  };

  const renderAiForm = () => (
    <div className="space-y-4">
      <form onSubmit={handleAiSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_business_type')}
          </label>
          <input
            type="text"
            value={aiQuestions.businessType}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, businessType: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_business_type_placeholder')}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_business_description')}
          </label>
          <textarea
            value={aiQuestions.businessDescription}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, businessDescription: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_business_description_placeholder')}
            rows="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_header_needs')}
          </label>
          <textarea
            value={aiQuestions.headerNeeds}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, headerNeeds: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_header_needs_placeholder')}
            rows="3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_body_needs')}
          </label>
          <textarea
            value={aiQuestions.bodyNeeds}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, bodyNeeds: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_body_needs_placeholder')}
            rows="3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_footer_needs')}
          </label>
          <textarea
            value={aiQuestions.footerNeeds}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, footerNeeds: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_footer_needs_placeholder')}
            rows="3"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_critical_fields')}
          </label>
          <textarea
            value={aiQuestions.criticalFields}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, criticalFields: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_critical_fields_placeholder')}
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('templates.ai_compliance_requirements')}
          </label>
          <textarea
            value={aiQuestions.complianceRequirements}
            onChange={(e) => setAiQuestions((prev) => ({ ...prev, complianceRequirements: e.target.value }))}
            className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            placeholder={t('templates.ai_compliance_requirements_placeholder')}
            rows="3"
          />
        </div>
        <button
          type="submit"
          disabled={aiLoading}
          className={`w-full p-2 rounded-md transition duration-200 ${
            aiLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {aiLoading ? t('templates.ai_generating') : t('templates.ai_generate_template')}
        </button>
      </form>
      {templateResult && (
        <div className="mt-4">
          <div className="text-sm text-green-600 mb-2">{templateResult}</div>
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
          >
            {t('templates.save_template')}
          </button>
        </div>
      )}
    </div>
  );

  return renderAiForm();
};

export default AITemplateCreator;