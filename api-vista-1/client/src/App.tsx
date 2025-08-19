import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from 'react-i18next';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import i18n from "@/lib/i18n";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import ProvidersPage from "@/pages/ProvidersPage";
import CategoriesPage from "@/pages/CategoriesPage";
import ServicesPage from "@/pages/ServicesPage";
import ApisPage from "@/pages/ApisPage";
import EndpointsPage from "@/pages/EndpointsPage";
import OperationsPage from "@/pages/OperationsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/providers" component={ProvidersPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/apis" component={ApisPage} />
        <Route path="/endpoints" component={EndpointsPage} />
        <Route path="/operations" component={OperationsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
