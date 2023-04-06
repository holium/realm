import { useRouter } from 'next/router';
import { useCallback } from 'react';

type AccountPage =
  | '/account'
  | '/account/custom-domain'
  | '/account/download-realm'
  | '/account/s3-storage'
  | '/account/statistics';

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
};

export const useNavigation = () => {
  const router = useRouter();

  const goToPage = useCallback((page: Page) => router.push(page), [router]);

  const logout = useCallback(() => {
    goToPage('/');
    localStorage.clear();
  }, [router]);

  return { goToPage, logout };
};
