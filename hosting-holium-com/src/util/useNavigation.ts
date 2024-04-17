import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { capitalizeFirstLetter } from '@holium/design-system/util';
import {
  OnboardingPage,
  OnboardingStorage,
  SidebarSection,
  ThirdEarthProductType,
} from '@holium/shared';

export const accountPageUrl: Record<string, OnboardingPage> = {
  Support: '/account/support',
  'Custom Domain': '/account/custom-domain',
  Storage: '/account/storage',
  Hosting: '/account',
  'Get Hosting': '/choose-id',
};

export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const currentAccountSection = useMemo(() => {
    const isAccountSection = pathname.split('/')[1] === 'account';
    if (!isAccountSection) return null;

    const path = pathname.split('/')[2] ?? SidebarSection.Hosting;
    const eachWordCapitalized = path
      .split('-')
      .map((word) => capitalizeFirstLetter(word))
      .join(' ');
    return eachWordCapitalized as SidebarSection;
  }, [pathname]);

  const goToPage = useCallback(
    (
      page: OnboardingPage,
      params?: {
        email?: string;
        back_url?: OnboardingPage;
        redirect_url?: OnboardingPage;
        haha?: string; // Hide "Already have an account"
        product_type?: ThirdEarthProductType;
      }
    ) => {
      try {
        const path =
          page + (params ? `?${new URLSearchParams(params).toString()}` : '');
        router.push(path);
        return Promise.resolve(true);
      } catch (e) {
        console.error(e);
        return Promise.resolve(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    goToPage('/login');
    OnboardingStorage.reset();
  }, [goToPage]);

  return { currentAccountSection, goToPage, logout };
};
