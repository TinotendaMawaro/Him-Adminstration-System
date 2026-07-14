import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOnboardingStore = create(
  persist(
    (set) => ({
      hasCompletedLocationEntry: false,
      hasSeenTour: false,
      currentStep: 0,
      dismissedRecommendations: [],

      setLocationComplete: () => set({ hasCompletedLocationEntry: true }),
      setTourComplete: () => set({ hasSeenTour: true }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      reset: () =>
        set({
          hasCompletedLocationEntry: false,
          hasSeenTour: false,
          currentStep: 0,
          dismissedRecommendations: [],
        }),
      dismissRecommendation: (groupId) =>
        set((s) => ({
          dismissedRecommendations: [...s.dismissedRecommendations, groupId],
        })),
    }),
    {
      name: "him-onboarding-storage",
    }
  )
);
