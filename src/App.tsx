import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import CityPage from "./pages/CityPage";
import CompanyPage from "./pages/CompanyPage";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import LeadForm from "./pages/LeadForm";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from "./components/ScrollToTop";
import GuidesPage from "./pages/guider/index";
import GuidePage from "./pages/guider/[slug]";
import Kalender from "./pages/Kalender";
import QuestionsPage from "./pages/sporsmal/index";
import QuestionPage from "./pages/sporsmal/[slug]";
import SamarbeidPage from "./pages/samarbeid";
import { OfferBar } from '@/components/OfferBar';
import CompanySearch from "@/pages/CompanySearch";
import { BehandlingPage } from '@/pages/BehandlingPage';
import { BehandlingerPage } from "@/pages/BehandlingerPage";
import TreatmentCityPage from '@/pages/TreatmentCityPage';
import Cookies from "@/pages/Cookies";
import ArtiklerPage from "./pages/artikler";
import ArticlePage from "./pages/artikler/[slug]";

const queryClient = new QueryClient();

interface AppRoute {
  path: string;
  element: React.ReactNode;
}

const router = createBrowserRouter([
  {
    element: (
      <>
        <Navbar />
        <ScrollToTop />
        <Outlet />
        <Footer />
      </>
    ),
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/klinikk/:name",
        element: <CompanyPage />,
      },
      {
        path: "/:city",
        element: <CityPage />,
      },
      {
        path: "/om-oss",
        element: <AboutUs />,
      },
      {
        path: "/kontakt",
        element: <Contact />,
      },
      {
        path: "/personvern",
        element: <Privacy />,
      },
      {
        path: "/tilbud",
        element: <LeadForm />,
      },
      {
        path: "/guider",
        element: <GuidesPage />,
      },
      {
        path: "/guider/:slug",
        element: <GuidePage />,
      },
      {
        path: "/kalender",
        element: <Kalender />,
      },
      {
        path: "/sporsmal",
        element: <QuestionsPage />,
      },
      {
        path: "/sporsmal/:slug",
        element: <QuestionPage />,
      },
      {
        path: "/samarbeid",
        element: <SamarbeidPage />,
      },
      {
        path: "/company-search",
        element: <CompanySearch />
      },
      {
        path: "/behandling/:id",
        element: <BehandlingPage />,
      },
      {
        path: "/behandlinger",
        element: <BehandlingerPage />
      },
      {
        path: "/behandling/:treatment/:city",
        element: <TreatmentCityPage />
      },
      {
        path: "/cookies",
        element: <Cookies />,
      },
      {
        path: "/artikler",
        element: <ArtiklerPage />,
      },
      {
        path: "/artikler/:slug",
        element: <ArticlePage />,
      },
    ],
  },
]);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Toaster />
            <Sonner />
            <RouterProvider router={router} />
            <OfferBar />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;