import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const ML_URL = process.env.ML_SERVER_URL || "http://localhost:8000";

let authToken = "";
let userId = "";
let moodLogId = "";
let recommendationId = "";

// Test colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n${"=".repeat(50)}`, "blue");
  log(`Testing: ${name}`, "blue");
  log("=".repeat(50), "blue");
}

async function test(endpoint, method = "GET", data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 5000,
    };
    if (data) config.data = data;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return {
        success: false,
        error: `Connection refused. Is the server running on ${BASE_URL}?`,
        status: 0,
      };
    }
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

async function testML(endpoint, data) {
  try {
    const response = await axios.post(`${ML_URL}${endpoint}`, data, {
      timeout: 5000,
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return {
        success: false,
        error: `Connection refused. Is the ML server running on ${ML_URL}?`,
        status: 0,
      };
    }
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// ==================== ML SERVER TESTS ====================

async function testMLServer() {
  logTest("ML Server Tests");

  // Test ML Server Health
  log("\n1. Testing ML Server Health...", "yellow");
  const mlHealth = await testML("/", {});
  if (mlHealth.success) {
    log("✓ ML Server is running", "green");
    console.log(JSON.stringify(mlHealth.data, null, 2));
  } else {
    log("✗ ML Server is not accessible", "red");
    log(`Error: ${JSON.stringify(mlHealth.error)}`, "red");
  }

  // Test Sentiment Prediction
  log("\n2. Testing Sentiment Prediction...", "yellow");
  const sentimentTest = await testML("/predict", {
    text: "I feel great today! Everything is going well.",
  });
  if (sentimentTest.success) {
    log("✓ Sentiment prediction works", "green");
    console.log(JSON.stringify(sentimentTest.data, null, 2));
  } else {
    log("✗ Sentiment prediction failed", "red");
    log(`Error: ${JSON.stringify(sentimentTest.error)}`, "red");
  }

  // Test Recommendation
  log("\n3. Testing Activity Recommendations...", "yellow");
  const recommendTest = await testML("/recommend", {
    moodScore: 4,
    emotionTag: "sad",
  });
  if (recommendTest.success) {
    log("✓ Activity recommendations work", "green");
    console.log(JSON.stringify(recommendTest.data, null, 2));
  } else {
    log("✗ Activity recommendations failed", "red");
    log(`Error: ${JSON.stringify(recommendTest.error)}`, "red");
  }

  // Test Chat Endpoint
  log("\n4. Testing Chat Endpoint...", "yellow");
  const chatTest = await testML("/chat", {
    message: "I'm feeling anxious today",
  });
  if (chatTest.success) {
    log("✓ Chat endpoint works", "green");
    console.log(JSON.stringify(chatTest.data, null, 2));
  } else {
    log("✗ Chat endpoint failed", "red");
    log(`Error: ${JSON.stringify(chatTest.error)}`, "red");
  }
}

// ==================== BACKEND API TESTS ====================

async function testAuth() {
  logTest("Authentication Tests");

  // Test Signup
  log("\n1. Testing User Signup...", "yellow");
  const signupData = {
    firstName: "Test",
    lastName: "User",
    email: `test${Date.now()}@example.com`,
    password: "testpass123",
  };
  const signup = await test("/api/auth/signup", "POST", signupData);
  if (signup.success) {
    log("✓ Signup successful", "green");
    authToken = signup.data.token;
    userId = signup.data.user.id;
    console.log(`Token: ${authToken.substring(0, 20)}...`);
  } else {
    log("✗ Signup failed", "red");
    log(`Error: ${JSON.stringify(signup.error)}`, "red");
    return false;
  }

  // Test Login
  log("\n2. Testing User Login...", "yellow");
  const login = await test("/api/auth/login", "POST", {
    email: signupData.email,
    password: signupData.password,
  });
  if (login.success) {
    log("✓ Login successful", "green");
    authToken = login.data.token;
  } else {
    log("✗ Login failed", "red");
    log(`Error: ${JSON.stringify(login.error)}`, "red");
  }

  // Test Logout
  log("\n3. Testing Logout...", "yellow");
  const logout = await test("/api/auth/logout", "POST", null, authToken);
  if (logout.success) {
    log("✓ Logout successful", "green");
  } else {
    log("✗ Logout failed", "red");
    log(`Error: ${JSON.stringify(logout.error)}`, "red");
  }

  return true;
}

async function testUser() {
  logTest("User Profile Tests");

  // Test Get Profile
  log("\n1. Testing Get Profile...", "yellow");
  const profile = await test("/api/user/profile", "GET", null, authToken);
  if (profile.success) {
    log("✓ Get profile successful", "green");
    console.log(JSON.stringify(profile.data, null, 2));
  } else {
    log("✗ Get profile failed", "red");
    log(`Error: ${JSON.stringify(profile.error)}`, "red");
  }

  // Test Update Profile
  log("\n2. Testing Update Profile...", "yellow");
  const update = await test(
    "/api/user/profile",
    "PUT",
    {
      firstName: "Updated",
      preferences: { exercise: true, music: false, meditation: true },
    },
    authToken
  );
  if (update.success) {
    log("✓ Update profile successful", "green");
    console.log(JSON.stringify(update.data, null, 2));
  } else {
    log("✗ Update profile failed", "red");
    log(`Error: ${JSON.stringify(update.error)}`, "red");
  }
}

async function testMood() {
  logTest("Mood Logging Tests");

  // Test Add Mood Log
  log("\n1. Testing Add Mood Log...", "yellow");
  const moodLog = await test(
    "/api/mood/log",
    "POST",
    {
      moodScore: 7,
      emotionTag: "happy",
      notes: "Feeling great today!",
      activityDone: false,
    },
    authToken
  );
  if (moodLog.success) {
    log("✓ Add mood log successful", "green");
    moodLogId = moodLog.data.log._id;
    console.log(JSON.stringify(moodLog.data, null, 2));
  } else {
    log("✗ Add mood log failed", "red");
    log(`Error: ${JSON.stringify(moodLog.error)}`, "red");
  }

  // Test Get Mood History
  log("\n2. Testing Get Mood History...", "yellow");
  const history = await test("/api/mood/history", "GET", null, authToken);
  if (history.success) {
    log("✓ Get mood history successful", "green");
    console.log(
      `Total logs: ${
        history.data.pagination?.total || history.data.logs?.length || 0
      }`
    );
  } else {
    log("✗ Get mood history failed", "red");
    log(`Error: ${JSON.stringify(history.error)}`, "red");
  }

  // Test Mood Analytics
  log("\n3. Testing Mood Analytics...", "yellow");
  const analytics = await test(
    "/api/mood/analytics?period=week",
    "GET",
    null,
    authToken
  );
  if (analytics.success) {
    log("✓ Get mood analytics successful", "green");
    console.log(JSON.stringify(analytics.data, null, 2));
  } else {
    log("✗ Get mood analytics failed", "red");
    log(`Error: ${JSON.stringify(analytics.error)}`, "red");
  }
}

async function testRecommendations() {
  logTest("Recommendation Tests");

  // Test Personalized Recommendations
  log("\n1. Testing Personalized Recommendations...", "yellow");
  const personalized = await test(
    "/api/recommendations/personalized",
    "GET",
    null,
    authToken
  );
  if (personalized.success) {
    log("✓ Get personalized recommendations successful", "green");
    recommendationId = personalized.data.recommendation._id;
    console.log(JSON.stringify(personalized.data, null, 2));
  } else {
    log("✗ Get personalized recommendations failed", "red");
    log(`Error: ${JSON.stringify(personalized.error)}`, "red");
  }

  // Test General Recommendations
  log("\n2. Testing General Recommendations...", "yellow");
  const general = await test("/api/recommendations/general", "GET");
  if (general.success) {
    log("✓ Get general recommendations successful", "green");
    console.log(JSON.stringify(general.data, null, 2));
  } else {
    log("✗ Get general recommendations failed", "red");
    log(`Error: ${JSON.stringify(general.error)}`, "red");
  }

  // Test Update Recommendation Status
  if (recommendationId) {
    log("\n3. Testing Update Recommendation Status...", "yellow");
    const updateStatus = await test(
      `/api/recommendations/${recommendationId}/status`,
      "PATCH",
      { status: "accepted" },
      authToken
    );
    if (updateStatus.success) {
      log("✓ Update recommendation status successful", "green");
      console.log(JSON.stringify(updateStatus.data, null, 2));
    } else {
      log("✗ Update recommendation status failed", "red");
      log(`Error: ${JSON.stringify(updateStatus.error)}`, "red");
    }
  }
}

async function testChat() {
  logTest("Chat Tests");

  // Test Send Chat Query
  log("\n1. Testing Send Chat Query...", "yellow");
  const chat = await test(
    "/api/chat/query",
    "POST",
    { message: "I'm feeling anxious today" },
    authToken
  );
  if (chat.success) {
    log("✓ Send chat query successful", "green");
    console.log(JSON.stringify(chat.data, null, 2));
  } else {
    log("✗ Send chat query failed", "red");
    log(`Error: ${JSON.stringify(chat.error)}`, "red");
  }

  // Test Get Chat History
  log("\n2. Testing Get Chat History...", "yellow");
  const history = await test("/api/chat/history", "GET", null, authToken);
  if (history.success) {
    log("✓ Get chat history successful", "green");
    console.log(
      `Total messages: ${
        history.data.total || history.data.messages?.length || 0
      }`
    );
  } else {
    log("✗ Get chat history failed", "red");
    log(`Error: ${JSON.stringify(history.error)}`, "red");
  }
}

async function testResources() {
  logTest("Resource Tests");

  // Test Get All Resources
  log("\n1. Testing Get All Resources...", "yellow");
  const allResources = await test("/api/resources/all", "GET");
  if (allResources.success) {
    log("✓ Get all resources successful", "green");
    console.log(
      `Total resources: ${
        allResources.data.pagination?.total ||
        allResources.data.resources?.length ||
        0
      }`
    );
  } else {
    log("✗ Get all resources failed", "red");
    log(`Error: ${JSON.stringify(allResources.error)}`, "red");
  }

  // Test Get Resources by Category
  log("\n2. Testing Get Resources by Category...", "yellow");
  const categoryResources = await test("/api/resources/articles", "GET");
  if (categoryResources.success) {
    log("✓ Get resources by category successful", "green");
    console.log(
      `Total resources: ${
        categoryResources.data.pagination?.total ||
        categoryResources.data.resources?.length ||
        0
      }`
    );
  } else {
    log("✗ Get resources by category failed", "red");
    log(`Error: ${JSON.stringify(categoryResources.error)}`, "red");
  }
}

async function testHealth() {
  logTest("Health Check Tests");

  // Test Health Endpoint
  log("\n1. Testing Health Endpoint...", "yellow");
  const health = await test("/health", "GET");
  if (health.success) {
    log("✓ Health check successful", "green");
    console.log(JSON.stringify(health.data, null, 2));
  } else {
    log("✗ Health check failed", "red");
    log(`Error: ${JSON.stringify(health.error)}`, "red");
  }

  // Test API Info
  log("\n2. Testing API Info...", "yellow");
  const apiInfo = await test("/api", "GET");
  if (apiInfo.success) {
    log("✓ API info successful", "green");
    console.log(JSON.stringify(apiInfo.data, null, 2));
  } else {
    log("✗ API info failed", "red");
    log(`Error: ${JSON.stringify(apiInfo.error)}`, "red");
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  log("\n" + "=".repeat(50), "blue");
  log("MIND EASE API TEST SUITE", "blue");
  log("=".repeat(50), "blue");

  try {
    // Test ML Server
    await testMLServer();

    // Test Backend Health
    await testHealth();

    // Test Authentication
    const authSuccess = await testAuth();
    if (!authSuccess) {
      log("\n⚠ Authentication failed. Skipping authenticated tests.", "yellow");
      return;
    }

    // Test User Profile
    await testUser();

    // Test Mood Logging
    await testMood();

    // Test Recommendations
    await testRecommendations();

    // Test Chat
    await testChat();

    // Test Resources
    await testResources();

    log("\n" + "=".repeat(50), "green");
    log("ALL TESTS COMPLETED", "green");
    log("=".repeat(50), "green");
  } catch (error) {
    log(`\n✗ Test suite error: ${error.message}`, "red");
    console.error(error);
  }
}

// Run tests
runAllTests();
