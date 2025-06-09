import { RouterProvider } from 'react-router-dom';
import router from 'routes';
import ThemeCustomization from 'themes';
import { AuthProvider } from 'context/AuthContext';
import ErrorBoundary from 'components/ErrorBoundary';
import ScrollTop from 'components/ScrollTop';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeCustomization>
          <ScrollTop>
            <RouterProvider router={router} />
          </ScrollTop>
        </ThemeCustomization>
      </AuthProvider>
    </ErrorBoundary>
  );
}
