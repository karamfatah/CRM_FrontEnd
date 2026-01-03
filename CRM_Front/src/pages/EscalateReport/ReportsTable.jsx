
import React, { useState } from 'react';
import { format } from 'date-fns';

const ReportsTable = ({ reports, signatureUrls, t, setSelectedReport }) => {
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    reportType: '',
    user_created_name: '',
    main_location_name: '',
    qa_section: '',
    qa_sub_section: '',
    created_at: '',
    tags: '',
  });

  const handleColumnFilterChange = (e) => {
    const { name, value } = e.target;
    setColumnFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredReports = reports.filter((report) => {
    return (
      (report.name || 'Unnamed Report').toLowerCase().includes(columnFilters.name.toLowerCase()) &&
      (report.reportType || '').toLowerCase().includes(columnFilters.reportType.toLowerCase()) &&
      (report.user_created_name || '').toLowerCase().includes(columnFilters.user_created_name.toLowerCase()) &&
      (report.main_location_name || report.structure?.location_details?.main_location_id || '').toLowerCase().includes(columnFilters.main_location_name.toLowerCase()) &&
      (report.qa_section || report.structure?.location_details?.section_qa_id || '').toLowerCase().includes(columnFilters.qa_section.toLowerCase()) &&
      (report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || '').toLowerCase().includes(columnFilters.qa_sub_section.toLowerCase()) &&
      (report.created_at ? format(new Date(report.created_at), 'PPP') : '').toLowerCase().includes(columnFilters.created_at.toLowerCase()) &&
      (report.tags || '').toLowerCase().includes(columnFilters.tags.toLowerCase())
    );
  });

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-indigo-50 dark:bg-indigo-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.report_name') || 'Name'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.report_type') || 'Report Type'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.created_by') || 'Created By'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.main_location') || 'Main Location'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.qa_section') || 'QA Section'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.qa_sub_section') || 'QA Sub-Section'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.created_at') || 'Created At'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.tag') || 'Tag'}
            </th>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {['name', 'reportType', 'user_created_name', 'main_location_name', 'qa_section', 'qa_sub_section', 'created_at', 'tags'].map((field) => (
              <td key={field} className="px-6 py-2">
                <input
                  type="text"
                  name={field}
                  value={columnFilters[field]}
                  onChange={handleColumnFilterChange}
                  placeholder={`Filter ${t(`reports.${field}`) || field.replace('_', ' ')}`}
                  className="w-full py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </td>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredReports.map((report) => {
            const reportId = report._id?.$oid || report.id;
            return (
              <tr
                key={reportId}
                className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-200"
                onClick={() => setSelectedReport(report)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedReport(report);
                  }
                }}
                aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.name || 'Unnamed Report'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.reportType || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.user_created_name || t('reports.unknown') || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.created_at ? format(new Date(report.created_at), 'PPP') : t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.tags ? t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags : t('reports.unknown') || 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;
