
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageContainer showHeader={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <Logo size="large" />
        </div>
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-corporate-700 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            Oops! The page you are looking for does not exist.
          </p>
          <Button 
            className="bg-corporate-600 hover:bg-corporate-700"
            onClick={() => navigate('/')}
          >
            Go back home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotFound;
