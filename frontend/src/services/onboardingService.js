import { onboardingAPI } from "@/lib/api"

export const startOnboarding = async () => {
  const response = await onboardingAPI.start()
  return response.data
}

export const submitOnboardingAnswer = async (payload) => {
  const response = await onboardingAPI.answer(payload)
  return response.data
}

export const fetchNextOnboardingQuestion = async () => {
  const response = await onboardingAPI.next()
  return response.data
}

export const completeOnboarding = async () => {
  const response = await onboardingAPI.complete({ confirm: true })
  return response.data
}

export const fetchOnboardingProfile = async () => {
  const response = await onboardingAPI.profile()
  return response.data
}
