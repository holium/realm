export const OnboardingActions = {
  agreedToDisclaimer: async() => {
    return await window.electron.os.onboarding.agreedToDisclaimer();
  },

  setSelfHosted: async(selfHosted: boolean) => {
    return await window.electron.os.onboarding.setSelfHosted(selfHosted);
  },

  clear: async () => {
    await window.electron.os.onboarding.clear();
    console.log('onboarding cleared.')
  }
}
