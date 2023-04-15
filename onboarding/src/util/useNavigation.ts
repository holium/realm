import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { capitalizeFirstLetter } from '@holium/design-system/util';
import { SidebarSection } from '@holium/shared';

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

  const currentAccountSection = useMemo(() => {
    const path = router.pathname.split('/')[2] ?? SidebarSection.Hosting;
    const eachWordCapitalized = path
      .split('-')
      .map((word) => capitalizeFirstLetter(word))
      .join(' ');
    return eachWordCapitalized as SidebarSection;
  }, [router.pathname]);

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

  return { currentAccountSection, goToPage, logout };
};
