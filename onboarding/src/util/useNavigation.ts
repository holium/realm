import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { capitalizeFirstLetter } from '@holium/design-system/util';
import {
  SidebarSection,
  OnboardingPage,
  OnboardingStorage,
} from '@holium/shared';

export const accountPageUrl: Record<string, OnboardingPage> = {
  'Download Realm': '/account/download-realm',
  'Custom Domain': '/account/custom-domain',
  'S3 Storage': '/account/s3-storage',
  Statistics: '/account/statistics',
  Hosting: '/account',
  'Get Hosting': '/choose-id',
};

export const useNavigation = () => {
  const router = useRouter();

  const currentAccountSection = useMemo(() => {
    const isAccountSection = router.pathname.split('/')[1] === 'account';
    if (!isAccountSection) return null;

    const path = router.pathname.split('/')[2] ?? SidebarSection.Hosting;
    const eachWordCapitalized = path
      .split('-')
      .map((word) => capitalizeFirstLetter(word))
      .join(' ');
    return eachWordCapitalized as SidebarSection;
  }, [router.pathname]);

  const goToPage = useCallback(
    (page: OnboardingPage, params?: Record<string, string>) => {
      const path =
        page + (params ? `?${new URLSearchParams(params).toString()}` : '');
      return router.push(path);
    },
    [router]
  );

  const logout = useCallback(() => {
    goToPage('/login');
    OnboardingStorage.reset();
  }, [router]);

  return { currentAccountSection, goToPage, logout };
};
