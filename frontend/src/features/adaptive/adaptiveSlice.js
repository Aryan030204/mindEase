import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { chatAPI, insightAPI, moodAPI, patternAPI, recommendationAPI } from "@/lib/api"

const initialState = {
  currentEmotionalState: null,
  recommendations: null,
  recommendationHistory: [],
  dailySuggestions: [],
  patterns: [],
  forecast: null,
  insightProfile: null,
  collectiveSummary: {
    insightCards: [],
    behavioralTrendSummaries: [],
    recommendationEvolutionIndicators: [],
  },
  chatbotContext: null,
  chatMessages: [],
  dashboardStatus: "idle",
  chatStatus: "idle",
  moodStatus: "idle",
  recommendationActionStatus: "idle",
  error: null,
}

export const fetchAdaptiveDashboard = createAsyncThunk(
  "adaptive/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const results = await Promise.allSettled([
        moodAPI.getHistory({ limit: 1 }),
        recommendationAPI.getPersonalized(),
        recommendationAPI.getHistory(),
        recommendationAPI.getGeneral(),
        patternAPI.getPatterns(),
        patternAPI.getForecast(),
        insightAPI.getProfile(),
        insightAPI.getCollectiveSummary(),
      ])

      const getData = (index, fallback) =>
        results[index].status === "fulfilled" ? results[index].value.data : fallback

      return {
        currentEmotionalState: getData(0, { logs: [] }).logs?.[0] || null,
        recommendations: getData(1, {}).recommendation || null,
        recommendationHistory: getData(2, { history: [] }).history || [],
        dailySuggestions: getData(3, { suggestions: [] }).suggestions || [],
        patterns: getData(4, { patterns: { patterns: [] } }).patterns?.patterns || [],
        forecast: getData(5, {}).forecast || null,
        insightProfile: getData(6, {}).insight || null,
        collectiveSummary: getData(7, {}).summary || initialState.collectiveSummary,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load adaptive dashboard")
    }
  }
)

export const submitMoodLog = createAsyncThunk(
  "adaptive/submitMoodLog",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await moodAPI.addLog(payload)
      await dispatch(fetchAdaptiveDashboard())
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to save mood")
    }
  }
)

export const updateRecommendationFeedback = createAsyncThunk(
  "adaptive/updateRecommendationFeedback",
  async ({ recommendationId, activityId, action }, { dispatch, rejectWithValue }) => {
    try {
      const response = await recommendationAPI.updateStatus(recommendationId, activityId, action)
      await dispatch(fetchAdaptiveDashboard())
      return response.data.recommendation
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update recommendation")
    }
  }
)

export const fetchChatHistory = createAsyncThunk(
  "adaptive/fetchChatHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getHistory(50)
      return response.data.messages || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch chat history")
    }
  }
)

export const sendChatMessage = createAsyncThunk(
  "adaptive/sendChatMessage",
  async (message, { dispatch, rejectWithValue }) => {
    try {
      const response = await chatAPI.sendQuery(message)
      await dispatch(fetchChatHistory())
      return {
        context: response.data.context || null,
        reply: response.data.reply,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message")
    }
  }
)

const adaptiveSlice = createSlice({
  name: "adaptive",
  initialState,
  reducers: {
    resetAdaptiveState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdaptiveDashboard.pending, (state) => {
        state.dashboardStatus = "loading"
        state.error = null
      })
      .addCase(fetchAdaptiveDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded"
        state.currentEmotionalState = action.payload.currentEmotionalState
        state.recommendations = action.payload.recommendations
        state.recommendationHistory = action.payload.recommendationHistory
        state.dailySuggestions = action.payload.dailySuggestions
        state.patterns = action.payload.patterns
        state.forecast = action.payload.forecast
        state.insightProfile = action.payload.insightProfile
        state.collectiveSummary = action.payload.collectiveSummary
      })
      .addCase(fetchAdaptiveDashboard.rejected, (state, action) => {
        state.dashboardStatus = "failed"
        state.error = action.payload
      })
      .addCase(submitMoodLog.pending, (state) => {
        state.moodStatus = "loading"
        state.error = null
      })
      .addCase(submitMoodLog.fulfilled, (state, action) => {
        state.moodStatus = "succeeded"
        state.currentEmotionalState = action.payload.log
        state.patterns = action.payload.patterns?.patterns || state.patterns
        state.recommendations = action.payload.recommendation || state.recommendations
      })
      .addCase(submitMoodLog.rejected, (state, action) => {
        state.moodStatus = "failed"
        state.error = action.payload
      })
      .addCase(updateRecommendationFeedback.pending, (state) => {
        state.recommendationActionStatus = "loading"
        state.error = null
      })
      .addCase(updateRecommendationFeedback.fulfilled, (state, action) => {
        state.recommendationActionStatus = "succeeded"
        state.recommendations = action.payload
      })
      .addCase(updateRecommendationFeedback.rejected, (state, action) => {
        state.recommendationActionStatus = "failed"
        state.error = action.payload
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.chatStatus = "loading"
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.chatStatus = "succeeded"
        state.chatMessages = action.payload
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.chatStatus = "failed"
        state.error = action.payload
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.chatStatus = "loading"
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.chatStatus = "succeeded"
        state.chatbotContext = action.payload.context
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.chatStatus = "failed"
        state.error = action.payload
      })
  },
})

export const { resetAdaptiveState } = adaptiveSlice.actions
export default adaptiveSlice.reducer
