import { configureStore } from "@reduxjs/toolkit"
import onboardingReducer from "@/features/onboarding/onboardingSlice"
import adaptiveReducer from "@/features/adaptive/adaptiveSlice"

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    adaptive: adaptiveReducer,
  },
})

export default store
