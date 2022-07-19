import { OnboardingStep } from "os/services/onboarding/onboarding.model";
import { ShipConnectionData } from 'os/lib/shipHelpers';
import { HostingPlanet } from "os/api/holium";

export const OnboardingActions = {
  setStep: async (step: OnboardingStep) => {
    await window.electron.os.onboarding.setStep(step);
  },

  agreedToDisclaimer: async() => {
    return await window.electron.os.onboarding.agreedToDisclaimer();
  },

  setSelfHosted: async(selfHosted: boolean) => {
    return await window.electron.os.onboarding.setSelfHosted(selfHosted);
  },

  getAvailablePlanets: async(): Promise<HostingPlanet[]> => {
    return await window.electron.os.onboarding.getAvailablePlanets();
  },

  addShip: async(shipInfo: ShipConnectionData) => {
    return await window.electron.os.onboarding.addShip(shipInfo);
  },

  selectPlanet: async(planet: HostingPlanet) => {
    return await window.electron.os.onboarding.selectPlanet(planet);
  },

  getProfile: async () => {
    return await window.electron.os.onboarding.getProfile();
  },

  setProfile: async (profileData: {
    nickname: string;
    color: string;
    avatar: string | null;
  }) => {
    return await window.electron.os.onboarding.setProfile(profileData);
  },

  setPassword: async (password: string) => {
    return await window.electron.os.onboarding.setPassword(password);
  },

  installRealm: async () => {
    return await window.electron.os.onboarding.installRealm();
  },

  completeOnboarding: async () => {
    return await window.electron.os.onboarding.completeOnboarding();
  }
}
