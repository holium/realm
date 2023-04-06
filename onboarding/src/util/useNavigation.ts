import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { OnboardingPage } from '@holium/shared';

export const accountPageUrl: Record<string, OnboardingPage> = {
  'Download Realm': '/account/download-realm',
  'Custom Domain': '/account/custom-domain',
  'S3 Storage': '/account/s3-storage',
  Statistics: '/account/statistics',
  Hosting: '/account',
};

export const useNavigation = () => {
  const router = useRouter();

  const goToPage = useCallback(
    (page: OnboardingPage) => router.push(page),
    [router]
  );

  const logout = useCallback(() => {
    goToPage('/');
    localStorage.clear();
  }, [router]);

  return { goToPage, logout };
};
