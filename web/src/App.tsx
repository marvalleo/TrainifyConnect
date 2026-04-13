import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { AthletesPage } from "./pages/AthletesPage";
import { AddAthletePage } from "./pages/AddAthletePage";
import { AthleteProfilePage } from "./pages/AthleteProfilePage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { AddExercisePage } from "./pages/AddExercisePage";
import { RoutinesPage } from "./pages/RoutinesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="athletes" element={<AthletesPage />} />
            <Route path="athletes/new" element={<AddAthletePage />} />
            <Route path="athletes/:id" element={<AthleteProfilePage />} />
            <Route path="exercises" element={<ExercisesPage />} />
            <Route path="exercises/new" element={<AddExercisePage />} />
            <Route path="routines" element={<RoutinesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
