import { BrowserRouter as Router, Routes, Route } from "react-router";
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
import BasicTables from "./pages/Tables/BasicTables";
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
import ManageSponsership from "./pages/Management/ManageSponsership";
import CreateAnnouncements from "./pages/Management/CreateAnnouncements";
import ManageUserEdit from "./pages/Management/ManageUserEdit";
import Configuration from "./pages/Management/Configuration";
import ConfigurationPaymentTypes from "./pages/Management/ConfigurationPaymentTypes";
import ConfigurationRamadan from "./pages/Management/ConfigurationRamadan";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/leads" element={<BasicTables />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-fitra" element={<ManageFitra />} />
            <Route path="/manage-zakat" element={<ManageZakat />} />
            <Route path="/manage-sadaqah" element={<ManageSadaqah />} />
            <Route path="/manage-aid" element={<ManageAid />} />
            <Route path="/manage-sponsership" element={<ManageSponsership />} />
            <Route path="/create-announcements" element={<CreateAnnouncements />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/configuration/payment-types" element={<ConfigurationPaymentTypes />} />
            <Route path="/configuration/ramadan" element={<ConfigurationRamadan />} />
            <Route path="/manage-users/create" element={<ManageUserEdit />} />
            <Route path="/manage-users/:id/edit" element={<ManageUserEdit />} />

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
