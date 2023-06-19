import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import { capitalizeFirstLetter } from '@holium/design-system/util';
import {
  OnboardingPage,
  OnboardingStorage,
  SidebarSection,
} from '@holium/shared';

export const accountPageUrl: Record<string, OnboardingPage> = {
  'Get Realm': '/account/get-realm',
  'Download Realm': '/account/download-realm',
  'Custom Domain': '/account/custom-domain',
  Storage: '/account/storage',
  Hosting: '/account',
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
    (
      page: OnboardingPage,
      params?: {
        email?: string;
        back_url?: OnboardingPage;
        redirect_url?: OnboardingPage;
        haha?: string; // Hide "Already have an account"
      }
    ) => {
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
