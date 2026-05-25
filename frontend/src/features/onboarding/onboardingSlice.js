import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  startOnboarding,
  submitOnboardingAnswer,
  fetchNextOnboardingQuestion,
  completeOnboarding,
  fetchOnboardingProfile,
} from "@/services/onboardingService"

const initialState = {
  currentQuestion: null,
  answeredQuestions: [],
  adaptiveQuestionCount: 0,
  progress: { answered: 0, total: 0 },
  tempTraits: {},
  profile: null,
  flowComplete: false,
  status: "idle",
  profileStatus: "idle",
  error: null,
}

export const startOnboardingFlow = createAsyncThunk(
  "onboarding/start",
  async (_, { rejectWithValue }) => {
    try {
      return await startOnboarding()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to start onboarding")
    }
  }
)

export const submitAnswer = createAsyncThunk(
  "onboarding/answer",
  async (payload, { rejectWithValue }) => {
    try {
      return await submitOnboardingAnswer(payload)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit answer")
    }
  }
)

export const getNextQuestion = createAsyncThunk(
  "onboarding/next",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchNextOnboardingQuestion()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch next question")
    }
  }
)

export const completeOnboardingFlow = createAsyncThunk(
  "onboarding/complete",
  async (_, { rejectWithValue }) => {
    try {
      return await completeOnboarding()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete onboarding")
    }
  }
)

export const loadOnboardingProfile = createAsyncThunk(
  "onboarding/profile",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchOnboardingProfile()
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load profile")
    }
  }
)

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    resetOnboardingState: (state) => {
      state.currentQuestion = null
      state.answeredQuestions = []
      state.adaptiveQuestionCount = 0
      state.progress = { answered: 0, total: 0 }
      state.tempTraits = {}
      state.profile = null
      state.flowComplete = false
      state.status = "idle"
      state.profileStatus = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startOnboardingFlow.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(startOnboardingFlow.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.currentQuestion = action.payload.question
        state.progress = action.payload.progress || state.progress
        state.adaptiveQuestionCount = action.payload.progress?.adaptiveLimit || state.adaptiveQuestionCount
        state.flowComplete = !action.payload.question
      })
      .addCase(startOnboardingFlow.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
      .addCase(submitAnswer.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.answeredQuestions.push(action.meta.arg.questionId)
        state.tempTraits = action.payload.derivedTraits || state.tempTraits
        state.progress = action.payload.progress || state.progress
        state.adaptiveQuestionCount = action.payload.progress?.adaptiveLimit || state.adaptiveQuestionCount
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
      .addCase(getNextQuestion.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(getNextQuestion.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.currentQuestion = action.payload.question
        state.progress = action.payload.progress || state.progress
        state.adaptiveQuestionCount = action.payload.progress?.adaptiveLimit || state.adaptiveQuestionCount
        state.flowComplete = !action.payload.question
      })
      .addCase(getNextQuestion.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
      .addCase(completeOnboardingFlow.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(completeOnboardingFlow.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.profile = action.payload.profile || state.profile
        state.flowComplete = true
      })
      .addCase(completeOnboardingFlow.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload
      })
      .addCase(loadOnboardingProfile.pending, (state) => {
        state.profileStatus = "loading"
        state.error = null
      })
      .addCase(loadOnboardingProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded"
        state.profile = action.payload.profile
      })
      .addCase(loadOnboardingProfile.rejected, (state, action) => {
        state.profileStatus = "failed"
        state.error = action.payload
      })
  },
})

export const { resetOnboardingState } = onboardingSlice.actions

export default onboardingSlice.reducer
