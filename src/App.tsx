import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import DonorManagement from '@/pages/DonorManagement';
import IndianDonors from '@/pages/IndianDonors';
import RecipientManagement from '@/pages/RecipientManagement';
import InventoryManagement from '@/pages/InventoryManagement';
import Transfusions from '@/pages/Transfusions';
import Blockchain from '@/pages/Blockchain';
import Notifications from '@/pages/Notifications';
import NotFound from '@/pages/NotFound';
import { BloodBankProvider } from '@/contexts/BloodBankContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from './components/theme-provider';
import About from "@/pages/About";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <NotificationProvider>
        <BloodBankProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="donors" element={<DonorManagement />} />
                <Route path="indian-donors" element={<IndianDonors />} />
                <Route path="recipients" element={<RecipientManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="transfusions" element={<Transfusions />} />
                <Route path="blockchain" element={<Blockchain />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </BloodBankProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
