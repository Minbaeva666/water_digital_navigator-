import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Layout, App as AntdApp } from 'antd';
import { customLocale, customTheme } from './layouts/customConfig';
import './App.less';
import AppHeader from "./components/Header/Header.tsx";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import GuestRoute from './components/GuestRoute/GuestRoute';
import DigitalAtlasDetailPage from "./pages/digitalAtlasDetailPage/DigitalAtlasDetailPage.tsx";
import AppFooter from "./components/footer/footer.tsx";
import "./utils/utilities.css.less";
import ContactFloatingButton from "./components/contact/ContactFloatingButton";
import HelpdeskWidget from "./components/helpdesk/HelpdeskWidget";



const { Content } = Layout;

const HomePage = lazy(() => import('./pages/homePage/HomePage'));
const FaqPage = lazy(() => import('./pages/faq/FaqPage'));
const AccessibilityStatementPage = lazy(() => import('./pages/accessibilityStatement/AccessibilityStatementPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/privacyPolicy/PrivacyPolicyPage'));
const ImprintStatementPage = lazy(() => import('./pages/imprintStatement/ImprintStatementPage'));
const TermsOfUsePage = lazy(() => import('./pages/termsOfUse/TermsOfUsePage'));
const DigitalSolutionPdf = lazy(() => import('./components/DigitalSolutionPdf/DigitalSolutionPdf'));
const LoginPage = lazy(() => import('./pages/login/LoginPage/LoginPage'));
const RegistrationPage = lazy(() => import('./pages/login/RegistrationPage/RegistrationPage'));
const RegisterAsPrivatePersonPage = lazy(() => import('./pages/login/RegisterAsPrivatePersonPage/RegisterAsPrivatePersonPage'));
const RegisterAsRepresentativePage = lazy(() => import('./pages/login/RegisterAsRepresentativePage/RegisterAsRepresentativePage'));
const VerifyEmailPage = lazy(() => import('./pages/login/VerifyEmailPage/VerifyEmailPage'));
const ForgotPasswordRequestPage = lazy(() => import('./pages/login/ForgotPasswordRequestPage/ForgotPasswordRequestPage'));
const ResetPasswordPage = lazy(() => import('./pages/login/ResetPasswordPage/ResetPasswordPage'));
const RevokeRegistrationPage = lazy(() => import('./pages/login/RevokeRegistrationPage/RevokeRegistrationPage'));
const UserManagementAdminPage = lazy(() => import('./pages/admin/userManagementAdmin/UserManagementAdminPage.tsx'));
const UserCreateAdminPage = lazy(() => import('./pages/admin/userManagementAdmin/userCreateAdmin/UserCreateAdminPage.tsx'));
const UserEditAdminPage = lazy(() => import('./pages/admin/userManagementAdmin/userEditAdmin/UserEditAdminPage.tsx'));
const DigitalSolutionManagementAdminPage = lazy(() => import('./pages/admin/digitalSolutionManagementAdmin/DigitalSolutionManagementAdminPage.tsx'));
const DigitalSolutionCreateAdminPage = lazy(() => import('./pages/admin/digitalSolutionManagementAdmin/digitalSolutionCreateAdmin/DigitalSolutionCreateAdminPage.tsx'));
const DigitalSolutionEditAdminPage = lazy(() => import('./pages/admin/digitalSolutionManagementAdmin/digitalSolutionEditAdmin/DigitalSolutionEditAdminPage.tsx'));
const DigitalSolutionSelection = lazy(() => import('./pages/user/digitalSolutionSelection/DigitalSolutionSelection.tsx'));
const TaxonomyAdminPage = lazy(() => import('./pages/admin/taxonomyAdminPage/TaxonomyAdminPage.tsx'));
const OrganizationManagementAdminPage = lazy(() => import('./pages/admin/organizationManagementAdmin/OrganizationManagementAdminPage.tsx'));
const OrganizationCreateAdminPage = lazy(() => import('./pages/admin/organizationManagementAdmin/organizationCreateAdmin/OrganizationCreateAdminPage.tsx'));
const OrganizationEditAdminPage = lazy(() => import('./pages/admin/organizationManagementAdmin/organizationEditAdmin/OrganizationEditAdminPage.tsx'));
const DigitalAtlasPage = lazy(() => import('./pages/digitalAtlasPage/DigitalAtlasPage.tsx'));
const ExpertVideosPage = lazy(() => import('./pages/expertVideos/ExpertVideosPage.tsx')); 
const ExpertVideoManagementPage = lazy(() => import('./pages/admin/expertVideoManagement/ExpertVideoManagementPage.tsx'));
const MyDigitalSolutionsPage  = lazy(() => import('./pages/user/digitalSolutions/MyDigitalSolutionsPage.tsx'));
const DigitalSolutionCreateUserPage = lazy(() => import('./pages/user/digitalSolutionManagementUser/DigitalSolutionCreateUserPage.tsx'));
const DigitalSolutionEditUserPage  = lazy(() => import('./pages/user/digitalSolutionManagementUser/DigitalSolutionEditUserPage.tsx'));
const AppManagementAdminPage = lazy(() => import('./pages/admin/appManagementAdmin/AppManagementAdminPage.tsx'));
const KontaktPage = lazy(() => import('./pages/kontakt/KontaktPage.tsx'));
// const DigitalSolutionsOverviewPage = lazy(() => import('./pages/digitalSolutionsOverviewPage/DigitalSolutionsOverviewPage.tsx'));
const DigitalSolutionsOverviewPage = lazy(() => import('./pages/digitalSolutionsOverviewPage/DigitalSolutionsOverviewPage.tsx'));

const AppWrapper: React.FC = () => (
    <ConfigProvider locale={customLocale} theme={customTheme}>
        <AntdApp>
        {/* <Router> */}
        <Router basename="/dilowa">
            <Layout className="app-layout">
                <div className="app-container">
                    <AppHeader />

                    <Content className="app-content">
                        <Suspense fallback={<div>Lade Seite...</div>}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/digital-solutions" element={<DigitalSolutionsOverviewPage />} />
                                <Route path="/expert-videos" element={<ExpertVideosPage />} />
                                <Route path="/digital-atlas" element={<DigitalAtlasPage />} />
                                <Route path="/digital-atlas/digitale-solution/:id" element={<DigitalAtlasDetailPage />} />
                                <Route path="/create-digital-solution" element={<DigitalSolutionSelection />} />
                                <Route path="/create-digital-solution/pdf" element={<DigitalSolutionPdf />} />

                                <Route path="/login" element={<GuestRoute element={<LoginPage />} />} />
                                <Route path="/login/registration/*" element={<RegistrationPage />} />
                                <Route path="/revoke-registration" element={<RevokeRegistrationPage />} />
                                <Route path="/verify-email" element={<VerifyEmailPage />} />
                                <Route path="/login/registration/register-as-private-person" element={<RegisterAsPrivatePersonPage />} />
                                <Route path="/login/registration/register-as-representative" element={<RegisterAsRepresentativePage />} />
                                <Route path="/login/forgot-password" element={<ForgotPasswordRequestPage />} />
                                <Route path="/login/reset-password" element={<ResetPasswordPage />} />

                                <Route path="/admin/user-management" element={<ProtectedRoute requiredRole="ADMIN" element={<UserManagementAdminPage />} />} />
                                <Route path="/admin/user-management/user/new" element={<ProtectedRoute requiredRole="ADMIN" element={<UserCreateAdminPage />} />} />
                                <Route path="/admin/user-management/user/:id/edit" element={<ProtectedRoute requiredRole="ADMIN" element={<UserEditAdminPage />} />} />

                                <Route path="/admin/taxonomie-management" element={<ProtectedRoute requiredRole="ADMIN" element={<TaxonomyAdminPage />} />} />

                                <Route path="/admin/organization-management" element={<ProtectedRoute requiredRole="ADMIN" element={<OrganizationManagementAdminPage />} />} />
                                <Route path="/admin/organization-management/organization/new" element={<ProtectedRoute requiredRole="ADMIN" element={<OrganizationCreateAdminPage />} />} />
                                <Route path="/admin/organization-management/organization/:id/edit" element={<ProtectedRoute requiredRole="ADMIN" element={<OrganizationEditAdminPage />} />} />

                                <Route path="/admin/digital-solution-management" element={<ProtectedRoute requiredRole="ADMIN" element={<DigitalSolutionManagementAdminPage />} />} />
                                <Route path="/admin/digital-solution-management/digital-solution/new" element={<ProtectedRoute requiredRole="ADMIN" element={<DigitalSolutionCreateAdminPage />} />} />
                                <Route path="/admin/digital-solution-management/digital-solution/:id/edit" element={<ProtectedRoute requiredRole="ADMIN" element={<DigitalSolutionEditAdminPage />} />} />


                                <Route path="/my-digital-solutions" element={<MyDigitalSolutionsPage />} />
                                <Route path="/my-digital-solutions/new" element={<DigitalSolutionCreateUserPage />} />
                                <Route path="/my-digital-solutions/:id/edit" element={<DigitalSolutionEditUserPage />} />
                                <Route path="/admin/expert-video-management" element={<ExpertVideoManagementPage />} />

                                <Route path="/admin/app-management" element={<ProtectedRoute requiredRole="ADMIN" element={<AppManagementAdminPage />} />} />
                                <Route path="/faq" element={<FaqPage />} />
                                <Route path="/nutzungsbedingungen" element={<TermsOfUsePage />} />
                                <Route path="/barrierefreiheit" element={<AccessibilityStatementPage />} />
                                <Route path="/datenschutz" element={<PrivacyPolicyPage />} />
                                <Route path="/impressum" element={<ImprintStatementPage />} />
                                <Route path="/kontakt" element={<KontaktPage />} />

                            </Routes>
                        </Suspense>
                    </Content>

                    <AppFooter />
                        <ContactFloatingButton />
                        <HelpdeskWidget />
                    
                </div>
            </Layout>
        </Router>
        </AntdApp>
    </ConfigProvider>
);

export default AppWrapper;
