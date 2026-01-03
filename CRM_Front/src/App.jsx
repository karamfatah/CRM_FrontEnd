import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import './css/style.css';
import './charts/ChartjsConfig';
import './styles/fonts.css';

// Import pages
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Category from './pages/Categories/Category';
import ProtectedRoute from './ProtectedRoute';
import MainLocation from './pages/MainLocations/MainLocation';
import LocationsQa from './pages/LocationsQa/LocationsQa';
import SectionQa from './pages/SectionQa/SectionQa';
import SubSectionQa from './pages/SubSectionQa/SubSectionQa';
import Shift from './pages/Shift/Shift';
import Classification from './pages/Classification/Classification';
import Issue from './pages/Issue/Issue';
import QualityRecommendation from './pages/QualityRecommendation/QualityRecommendation';
import UsersManagement from './pages/UserManagement/UsersManagement';
import TemplateCreator from './pages/TemplateCreator/TemplateCreator';
import ReportCreator from './pages/ReportCreator/ReportCreator';
import DocumentationManagement from './pages/DocumentationManagement/DocumentationManagement';
import ReadDocumentations from './pages/ReadDocumentations/ReadDocumentations';
import SchemaCreator from './pages/SchemaCreator/SchemaCreator';
import ReadReports from './pages/ReadReports/ReadReports';
import TemplateSelector from './pages/TemplateEditor/TemplateSelector';
import TemplateEditor from './pages/TemplateEditor/TemplateEditor';
import ChatPage from './pages/Chat/ChatPage'; // Add ChatPage
import NavBarManagement from './pages/NavBarManagement/NavBarManagement'; // Add ChatPage
import PrivilegesManagement from './pages/PrivilegesManagement/PrivilegesManagement'; // Add ChatPage
import RolesManagement from './pages/RolesManagement/RolesManagement'; // Add ChatPage
import EscalateReport from './pages/EscalateReport/EscalateReport'; // Add ChatPage
import InvestigateReport from './pages/InvestigateReport/InvestigateReport'; // Add ChatPage
import ManagementAction from './pages/ManagementAction/ManagementAction'; // Add ChatPage
import TopReportView from './pages/TopReportView/TopReportView'; // Add ChatPage
import ViewTopSummary from './pages/ViewTopSummary/ViewTopSummary'; // Add ChatPage
import ReportsNameManagement from './pages/ReportsNameManagement/ReportsNameManagement'; // Add ChatPage
import DeptChkListReport from './pages/DeptChkListReport/DeptChkListReport'; // Add ChatPage
import CustomiseReport from './pages/CustomiseReport/CustomiseReport'; // Add ChatPage
import ChatGroupPage from './pages/Chat/ChatGroupPage'; // Add ChatPage
import ReadDetailsReports from './pages/ReadDetailsReports/ReadDetailsReports'; // Add ChatPage
import AdvancedReports from './pages/AdvancedReports/AdvancedReports'; // Add ChatPage
import IssueReports from './pages/AdvancedReports/IssueReports'; // Add ChatPage
import DynamicReadReport from './pages/AdvancedReports/DynamicReadReport'; // Add ChatPage
import DynamicReportAdvanced from './pages/AdvancedReports/DynamicReportAdvanced'; 
import CostingExecute from './pages/AdvancedReports/CostingExecute'; 
import RawInspectionPage from './pages/AdvancedReports/RawInspectionPage'; 
import Org from './pages/Org/Org';
import OrganizationDetails from './pages/OrganizationDetails/OrganizationDetails'; 
import GlobalUserManagement from './pages/UserManagement/GlobalUserManagement';
import HomeLand from './pages/HomeLand/HomeLand';
import Employees from './pages/Employees/Employees';
import RatingsDashboard from './pages/RatingsDashboard/RatingsDashboard';
import ReadRatings from './pages/ReadRatings/ReadRatings';
import RatingsNPSDashboard from './pages/RatingsNPSDashboard/RatingsNPSDashboard';
import DashLocationRating from './pages/DashLocationRating/DashLocationRating';
import NPSTable from './pages/NPSTable/NPSTable';
import EmployeeMode from './pages/EmployeeMode/EmployeeMode';
import ReportsAbuse from './pages/ReportsAbuse/ReportsAbuse';
import ApkUpload from './pages/ApkUpload/ApkUpload';
import EmailReports from './pages/EmailReports/EmailReports';
import ChatCustomers from './pages/ChatCustomers/ChatCustomers';
import ChatWithAICustomer from './pages/ChatWithAICustomer/ChatWithAICustomer';
import DeviceStatus from './pages/DeviceStatus/DeviceStatus';














function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/chat_withai_customer" element={<ChatWithAICustomer />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeLand />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/mainlocations" element={<MainLocation />} />
            <Route path="/locations" element={<LocationsQa />} />
            <Route path="/section" element={<SectionQa />} />
            <Route path="/subsection" element={<SubSectionQa />} />
            <Route path="/shifts" element={<Shift />} />
            <Route path="/classification" element={<Classification />} />
            <Route path="/issues" element={<Issue />} />
            {/* <Route path="/checklist_query" element={<Chec />} /> */}
            <Route path="/recommendations" element={<QualityRecommendation />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/temp_create" element={<TemplateCreator />} />
            <Route path="/report_create" element={<ReportCreator />} />
            <Route path="/doc_center" element={<DocumentationManagement />} />
            <Route path="/doc_read" element={<ReadDocumentations />} />
            <Route path="/schema_creator" element={<SchemaCreator />} />
            <Route path="/read_reports" element={<ReadReports />} />
            <Route path="/templates/select" element={<TemplateSelector />} />
            <Route path="/templates/edit/:id" element={<TemplateEditor />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/chat_group" element={<ChatGroupPage />} />
            <Route path="/nave_manage" element={<NavBarManagement />} />
            <Route path="/roles" element={<RolesManagement />} />
            <Route path="/priv" element={<PrivilegesManagement />} />
            <Route path="/escalate" element={<EscalateReport />} />
            <Route path="/investigate" element={<InvestigateReport />} />
            <Route path="/managment_action" element={<ManagementAction />} />
            <Route path="/top_view" element={<TopReportView />} />
            <Route path="/view_top_sum" element={<ViewTopSummary />} />
            <Route path="/reports_name" element={<ReportsNameManagement />} />
            <Route path="/dept_chk" element={<DeptChkListReport />} />
            <Route path="/custom_layout" element={<CustomiseReport />} />
            <Route path="/read_det_cust_rep" element={<ReadDetailsReports />} />
            <Route path="/adv_reports" element={<AdvancedReports />} />
            <Route path="/issue_report" element={<IssueReports />} />
            <Route path="/dynamic_report" element={<DynamicReadReport />} />
            <Route path="/dynamic_adv_report" element={<DynamicReportAdvanced />} />
            <Route path="/execution_reports" element={<CostingExecute />} />
            <Route path="/raw_material_checks" element={<RawInspectionPage />} /> 
            <Route path="/orgs" element={<Org />} />
            <Route path="/organization_details" element={<OrganizationDetails />} /> 
            <Route path="/global_users" element={<GlobalUserManagement />} /> 
            <Route path="/home" element={<HomeLand />} /> 
            <Route path="/employees" element={<Employees/>} /> 
            <Route path="/ratings" element={<ReadRatings/>} /> 
            <Route path="/rating_dash" element={<RatingsDashboard/>} /> 
            <Route path="/rating_nps_dash" element={<RatingsNPSDashboard/>} />
            <Route path="/dash_location_rating" element={<DashLocationRating/>} />
            <Route path="/ratting_nps-table" element={<NPSTable/>} />
            <Route path="/employee_mode" element={<EmployeeMode/>} />
            <Route path="/reports_abuse" element={<ReportsAbuse/>} />
            <Route path="/apk_management" element={<ApkUpload/>} />
            <Route path="/email_reports" element={<EmailReports/>} />
            <Route path="/chat_customers" element={<ChatCustomers/>} />
            <Route path="/device_status" element={<DeviceStatus/>} />
          </Route>


          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;