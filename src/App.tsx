import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import RequireAuth from "./components/auth/RequireAuth";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ManageUsers from "@/pages/Management/ManageUsers";
import ManageFitra from "@/pages/Management/ManageFitra";
import ManageZakat from "@/pages/Management/ManageZakat";
import ManageSadaqah from "./pages/Management/ManageSadaqah";
import ManageAid from "./pages/Management/ManageAid";
import CardRequests from "./pages/Management/CardRequests";
import BalanceDistribution from "./pages/Management/BalanceDistribution";
import ManageSponsership from "./pages/Management/ManageSponsership";
import CreateAnnouncements from "./pages/Management/CreateAnnouncements";
import ManageUserEdit from "./pages/Management/ManageUserEdit";
import Configuration from "./pages/Management/Configuration";
import ConfigurationPaymentTypes from "./pages/Management/ConfigurationPaymentTypes";
import ConfigurationRamadan from "./pages/Management/ConfigurationRamadan";
import ToastRenderer from "./components/common/ToastRenderer";
import ConfigurationFamilyBranches from "./pages/Management/ConfigurationFamilyBranches";

import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BiographyManagement from "./pages/BiographyManagement";
import HistoryArticles from "./pages/HistoryArticles";
import HistoryArticleEditor from "./pages/HistoryArticleEditor";
import CreateUser from "./pages/Management/CreateUser";
import EventLanding from "./pages/EventLanding";
import useGetUserPermissions from "./hooks/useGetUserPermissions";
import { hasConfigurationAccess, hasPageAccess } from "./utility/pageAccess";

const PageAccessRoute: React.FC<{ path: string; element: React.ReactElement }> = ({ path, element }) => {
  const { data: currentUserPermissionCodes = [], isLoading } = useGetUserPermissions();

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading access...</div>;
  }

  if (path === "/configuration") {
    return hasConfigurationAccess(currentUserPermissionCodes) ? element : <Navigate to="/" replace />;
  }

  return hasPageAccess(path, currentUserPermissionCodes) ? element : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <>
      <Router>
        <ToastRenderer />
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index path="/" element={<Home />} />
            <Route path="/event-live" element={<PageAccessRoute path="/event-live" element={<EventLanding />} />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/manage-users" element={<PageAccessRoute path="/manage-users" element={<ManageUsers />} />} />
            <Route path="/manage-fitra" element={<PageAccessRoute path="/manage-fitra" element={<ManageFitra />} />} />
            <Route path="/manage-zakat" element={<PageAccessRoute path="/manage-zakat" element={<ManageZakat />} />} />
            <Route path="/manage-sadaqah" element={<PageAccessRoute path="/manage-sadaqah" element={<ManageSadaqah />} />} />
            <Route path="/manage-aid" element={<PageAccessRoute path="/manage-aid" element={<ManageAid />} />} />
            <Route path="/card-requests" element={<PageAccessRoute path="/card-requests" element={<CardRequests />} />} />
            <Route path="/balance-distribution" element={<PageAccessRoute path="/balance-distribution" element={<BalanceDistribution />} />} />
            <Route path="/manage-sponsership" element={<PageAccessRoute path="/manage-sponsership" element={<ManageSponsership />} />} />
            <Route path="/create-announcements" element={<PageAccessRoute path="/create-announcements" element={<CreateAnnouncements />} />} />
            <Route path="/configuration" element={<PageAccessRoute path="/configuration" element={<Configuration />} />} />
            <Route path="/configuration/payment-types" element={<PageAccessRoute path="/configuration/payment-types" element={<ConfigurationPaymentTypes />} />} />
            <Route path="/configuration/ramadan" element={<PageAccessRoute path="/configuration/ramadan" element={<ConfigurationRamadan />} />} />
            <Route path="/manage-users/create" element={<PageAccessRoute path="/manage-users/create" element={<CreateUser />} />} />
            <Route path="/manage-users/:id/edit" element={<PageAccessRoute path="/manage-users/:id/edit" element={<ManageUserEdit />} />} />
            <Route path="/configuration/family-branches" element={<PageAccessRoute path="/configuration/family-branches" element={<ConfigurationFamilyBranches />} />} />
            <Route path="/about-us" element={<PageAccessRoute path="/about-us" element={<AboutUs />} />} />
            <Route path="/privacy-policy" element={<PageAccessRoute path="/privacy-policy" element={<PrivacyPolicy />} />} />
            <Route path="/biography-management" element={<PageAccessRoute path="/biography-management" element={<BiographyManagement />} />} />
            <Route path="/history-articles" element={<PageAccessRoute path="/history-articles" element={<HistoryArticles />} />} />
            <Route path="/history-articles/:id" element={<PageAccessRoute path="/history-articles/:id" element={<HistoryArticleEditor />} />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
