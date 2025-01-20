import { RecentArticles } from "@/components/RecentArticles";
import { Helmet } from "react-helmet-async";

const GuiderPage = () => {
  return (
    <>
      <Helmet>
        <title>Guider og artikler om regnskap | Regnskapsførerlisten.no</title>
        <meta 
          name="description" 
          content="Les våre guider og artikler om regnskap, bokføring, og økonomistyring. Få nyttige tips og råd for din bedrift."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Guider og artikler om regnskap
            </h1>
            <p className="text-lg text-gray-600">
              Få nyttige tips og råd om regnskap, bokføring og økonomistyring for din bedrift
            </p>
          </div>

          {/* Using the RecentArticles component but with full width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RecentArticles showAll={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default GuiderPage; 