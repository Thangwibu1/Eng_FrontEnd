import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from './shared/components/MainLayout';
import { useMe } from './features/auth/hooks/useMe';
import { Loading } from './shared/components/Loading';

// Pages
import { HomePage } from './features/dashboard/pages/HomePage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { VocabularyListPage } from './features/vocabulary/pages/VocabularyListPage';
import { VocabularyDetailPage } from './features/vocabulary/pages/VocabularyDetailPage';
import { AddVocabularyPage } from './features/vocabulary/pages/AddVocabularyPage';
import { ReadingListPage } from './features/reading/pages/ReadingListPage';
import { ReadingDetailPage } from './features/reading/pages/ReadingDetailPage';
import { DeckListPage } from './features/flashcard/pages/DeckListPage';
import { DeckDetailPage } from './features/flashcard/pages/DeckDetailPage';
import { ReviewPage } from './features/flashcard/pages/ReviewPage';
import { ContributionPage } from './features/contribution/pages/ContributionPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';

// Protected Route Wrapper
function ProtectedRoute() {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Layout Wrapper
function LayoutWrapper() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export const router = createBrowserRouter([
  {
    element: <LayoutWrapper />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/vocabularies',
        element: <VocabularyListPage />,
      },
      {
        path: '/vocabularies/:id',
        element: <VocabularyDetailPage />,
      },
      {
        path: '/readings',
        element: <ReadingListPage />,
      },
      {
        path: '/readings/:id',
        element: <ReadingDetailPage />,
      },
      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/flashcards',
            element: <DeckListPage />,
          },
          {
            path: '/flashcards/:id',
            element: <DeckDetailPage />,
          },
          {
            path: '/flashcards/:id/review',
            element: <ReviewPage />,
          },
          {
            path: '/contributions',
            element: <ContributionPage />,
          },
          {
            path: '/vocabularies/add',
            element: <AddVocabularyPage />,
          },
        ],
      },
      // Catch-all redirect to HomePage
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
