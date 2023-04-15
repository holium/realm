import { useRouter } from 'next/router';
import { useCallback } from 'react';

type AccountPage =
  | '/account'
  | '/account/custom-domain'
  | '/account/download-realm'
  | '/account/s3-storage'
  | '/account/statistics'
  | '/choose-id';

type OnboardingPage =
  | '/'
  | '/login'
  | '/verify-email'
  | '/choose-id'
  | '/payment'
  | '/booting'
  | '/credentials'
  | '/download';

type Page = AccountPage | OnboardingPage;

export const accountPageUrl: Record<string, AccountPage> = {
  'Download Realm': '/account/download-realm',
  'Custom Domain': '/account/custom-domain',
  'S3 Storage': '/account/s3-storage',
  Statistics: '/account/statistics',
  Hosting: '/account',
  'Get Hosting': '/choose-id',
};

export const useNavigation = () => {
  const router = useRouter();

  const goToPage = useCallback(
    (page: Page, params?: Record<string, string>) => {
      const path =
        page + (params ? `?${new URLSearchParams(params).toString()}` : '');
      return router.push(path);
    },
    [router]
  );

  const logout = useCallback(() => {
    goToPage('/');
    localStorage.clear();
  }, [router]);

  return { goToPage, logout };
};
