import { GetServerSideProps } from 'next';
import { requireAuth } from '@/lib/auth';

/**
 * /app entry point - redirects to dashboard
 */
export default function AppIndexPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check auth
  const authResult = await requireAuth(context);
  if ('redirect' in authResult) {
    return authResult;
  }

  // Authenticated - redirect to dashboard
  return {
    redirect: {
      destination: '/app/dashboard',
      permanent: false,
    },
  };
};
