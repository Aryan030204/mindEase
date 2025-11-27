import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const NODE_SERVER_URL = "https://mindease-node-server.onrender.com";
const ML_SERVER_URL = "https://mindease-ml-server.onrender.com";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let authToken = "";
let userId = "";
let moodLogId = "";
let recommendationId = "";

const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

async function testEndpoint(name, method, url, data = null, token = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
    if (data) config.data = data;

    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      log(`✓ ${name} - Status: ${response.status}`, "green");
      testResults.passed++;
      return { success: true, data: response.data, status: response.status };
    } else {
      log(`✗ ${name} - Expected ${expectedStatus}, got ${response.status}`, "red");
      testResults.failed++;
      testResults.errors.push(`${name}: Expected status ${expectedStatus}, got ${response.status}`);
      return { success: false, error: `Status mismatch`, status: response.status };
    }
  } catch (error) {
    const status = error.response?.status || 0;
    const errorMsg = error.response?.data || error.message;
    
    if (status === expectedStatus) {
      log(`✓ ${name} - Status: ${status} (Expected error)`, "green");
      testResults.passed++;
      return { success: true, data: errorMsg, status };
    } else {
      log(`✗ ${name} - Status: ${status}`, "red");
      log(`  Error: ${JSON.stringify(errorMsg)}`, "red");
      testResults.failed++;
      testResults.errors.push(`${name}: ${JSON.stringify(errorMsg)}`);
      return { success: false, error: errorMsg, status };
    }
  }
}

async function testMLServer() {
  log("\n" + "=".repeat(70), "blue");
  log("TESTING ML SERVER", "blue");
  log("=".repeat(70), "blue");

  // Test 1: Health Check
  await testEndpoint(
    "ML Server Health",
    "GET",
    `${ML_SERVER_URL}/`
  );

  // Test 2: Sentiment Prediction
  const predictResult = await testEndpoint(
    "ML Sentiment Prediction",
    "POST",
    `${ML_SERVER_URL}/predict`,
    { text: "I feel amazing today! Everything is going great!" }
  );
  if (predictResult.success) {
    log(`  Response: ${JSON.stringify(predictResult.data)}`, "cyan");
  }

  // Test 3: Negative Sentiment
  await testEndpoint(
    "ML Negative Sentiment",
    "POST",
    `${ML_SERVER_URL}/predict`,
    { text: "I'm feeling really down and sad today" }
  );

  // Test 4: Activity Recommendations - Low Mood
  const recommendResult = await testEndpoint(
    "ML Recommendations - Low Mood",
    "POST",
    `${ML_SERVER_URL}/recommend`,
    { moodScore: 3, emotionTag: "sad" }
  );
  if (recommendResult.success) {
    log(`  Response: ${JSON.stringify(recommendResult.data)}`, "cyan");
  }

  // Test 5: Activity Recommendations - High Mood
  await testEndpoint(
    "ML Recommendations - High Mood",
    "POST",
    `${ML_SERVER_URL}/recommend`,
    { moodScore: 8, emotionTag: "happy" }
  );

  // Test 6: Activity Recommendations - Anxious
  await testEndpoint(
    "ML Recommendations - Anxious",
    "POST",
    `${ML_SERVER_URL}/recommend`,
    { moodScore: 4, emotionTag: "anxious" }
  );
}

async function testNodeServer() {
  log("\n" + "=".repeat(70), "blue");
  log("TESTING NODE SERVER", "blue");
  log("=".repeat(70), "blue");

  // Health & Info
  log("\n--- Health & Info Endpoints ---", "yellow");
  await testEndpoint("Health Check", "GET", `${NODE_SERVER_URL}/health`);
  await testEndpoint("API Info", "GET", `${NODE_SERVER_URL}/api`);

  // Authentication
  log("\n--- Authentication Endpoints ---", "yellow");
  const signupEmail = `test${Date.now()}@example.com`;
  const signupData = {
    firstName: "Test",
    lastName: "User",
    email: signupEmail,
    password: "testpass123",
  };

  const signupResult = await testEndpoint(
    "User Signup",
    "POST",
    `${NODE_SERVER_URL}/api/auth/signup`,
    signupData,
    null,
    201
  );

  if (signupResult.success && signupResult.data.token) {
    authToken = signupResult.data.token;
    userId = signupResult.data.user.id;
    log(`  Token received: ${authToken.substring(0, 30)}...`, "cyan");
  }

  // Test login
  const loginResult = await testEndpoint(
    "User Login",
    "POST",
    `${NODE_SERVER_URL}/api/auth/login`,
    {
      email: signupEmail,
      password: "testpass123",
    }
  );

  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
  }

  // Test logout
  await testEndpoint(
    "User Logout",
    "POST",
    `${NODE_SERVER_URL}/api/auth/logout`,
    null,
    authToken
  );

  // Re-login for further tests
  const reLoginResult = await testEndpoint(
    "Re-login for Tests",
    "POST",
    `${NODE_SERVER_URL}/api/auth/login`,
    {
      email: signupEmail,
      password: "testpass123",
    }
  );
  if (reLoginResult.success && reLoginResult.data.token) {
    authToken = reLoginResult.data.token;
  }

  if (!authToken) {
    log("\n⚠️  Authentication failed. Skipping authenticated endpoints.", "yellow");
    return;
  }

  // User Profile
  log("\n--- User Profile Endpoints ---", "yellow");
  await testEndpoint(
    "Get Profile",
    "GET",
    `${NODE_SERVER_URL}/api/user/profile`,
    null,
    authToken
  );

  await testEndpoint(
    "Update Profile",
    "PUT",
    `${NODE_SERVER_URL}/api/user/profile`,
    {
      firstName: "Updated",
      preferences: {
        exercise: true,
        music: false,
        meditation: true,
      },
    },
    authToken
  );

  // Mood Logging
  log("\n--- Mood Logging Endpoints ---", "yellow");
  const moodResult = await testEndpoint(
    "Add Mood Log",
    "POST",
    `${NODE_SERVER_URL}/api/mood/log`,
    {
      moodScore: 7,
      emotionTag: "happy",
      notes: "Feeling great today!",
      activityDone: false,
    },
    authToken,
    201
  );

  if (moodResult.success && moodResult.data.log) {
    moodLogId = moodResult.data.log._id;
  }

  // Add another mood log (may update existing if same day, so 200 is valid)
  await testEndpoint(
    "Add Second Mood Log",
    "POST",
    `${NODE_SERVER_URL}/api/mood/log`,
    {
      moodScore: 5,
      emotionTag: "neutral",
      notes: "Just an average day",
      activityDone: true,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday's date
    },
    authToken,
    201
  );

  // Get mood history
  await testEndpoint(
    "Get Mood History",
    "GET",
    `${NODE_SERVER_URL}/api/mood/history`,
    null,
    authToken
  );

  // Get mood analytics
  await testEndpoint(
    "Get Mood Analytics (Week)",
    "GET",
    `${NODE_SERVER_URL}/api/mood/analytics?period=week`,
    null,
    authToken
  );

  await testEndpoint(
    "Get Mood Analytics (Month)",
    "GET",
    `${NODE_SERVER_URL}/api/mood/analytics?period=month`,
    null,
    authToken
  );

  // Recommendations
  log("\n--- Recommendation Endpoints ---", "yellow");
  await testEndpoint(
    "Get General Recommendations",
    "GET",
    `${NODE_SERVER_URL}/api/recommendations/general`
  );

  const recResult = await testEndpoint(
    "Get Personalized Recommendations",
    "GET",
    `${NODE_SERVER_URL}/api/recommendations/personalized`,
    null,
    authToken
  );

  if (recResult.success && recResult.data.recommendation) {
    recommendationId = recResult.data.recommendation._id;
    
    // Test update recommendation status
    await testEndpoint(
      "Update Recommendation Status",
      "PATCH",
      `${NODE_SERVER_URL}/api/recommendations/${recommendationId}/status`,
      { status: "accepted" },
      authToken
    );
  }

  // Chat
  log("\n--- Chat Endpoints ---", "yellow");
  await testEndpoint(
    "Send Chat Query",
    "POST",
    `${NODE_SERVER_URL}/api/chat/query`,
    { message: "I'm feeling anxious today. What can I do?" },
    authToken
  );

  await testEndpoint(
    "Send Second Chat Message",
    "POST",
    `${NODE_SERVER_URL}/api/chat/query`,
    { message: "How can I manage stress better?" },
    authToken
  );

  await testEndpoint(
    "Get Chat History",
    "GET",
    `${NODE_SERVER_URL}/api/chat/history`,
    null,
    authToken
  );

  // Resources
  log("\n--- Resource Endpoints ---", "yellow");
  await testEndpoint(
    "Get All Resources",
    "GET",
    `${NODE_SERVER_URL}/api/resources/all`
  );

  await testEndpoint(
    "Get Resources by Category (articles)",
    "GET",
    `${NODE_SERVER_URL}/api/resources/articles`
  );

  await testEndpoint(
    "Get Resources by Category (meditation)",
    "GET",
    `${NODE_SERVER_URL}/api/resources/meditation`
  );

  // Test invalid category
  await testEndpoint(
    "Get Resources - Invalid Category",
    "GET",
    `${NODE_SERVER_URL}/api/resources/invalid`,
    null,
    null,
    400
  );

  // Test validation errors
  log("\n--- Validation Tests ---", "yellow");
  await testEndpoint(
    "Signup - Invalid Email",
    "POST",
    `${NODE_SERVER_URL}/api/auth/signup`,
    {
      firstName: "Test",
      lastName: "User",
      email: "invalid-email",
      password: "test123",
    },
    null,
    400
  );

  await testEndpoint(
    "Signup - Short Password",
    "POST",
    `${NODE_SERVER_URL}/api/auth/signup`,
    {
      firstName: "Test",
      lastName: "User",
      email: "test2@example.com",
      password: "short",
    },
    null,
    400
  );

  await testEndpoint(
    "Mood Log - Invalid Score",
    "POST",
    `${NODE_SERVER_URL}/api/mood/log`,
    {
      moodScore: 15,
      emotionTag: "happy",
    },
    authToken,
    400
  );

  await testEndpoint(
    "Mood Log - Invalid Emotion",
    "POST",
    `${NODE_SERVER_URL}/api/mood/log`,
    {
      moodScore: 5,
      emotionTag: "invalid-emotion",
    },
    authToken,
    400
  );

  // Test unauthorized access
  log("\n--- Authorization Tests ---", "yellow");
  await testEndpoint(
    "Get Profile - No Token",
    "GET",
    `${NODE_SERVER_URL}/api/user/profile`,
    null,
    null,
    401
  );

  await testEndpoint(
    "Get Profile - Invalid Token",
    "GET",
    `${NODE_SERVER_URL}/api/user/profile`,
    null,
    "invalid-token-here",
    401
  );
}

async function runAllTests() {
  log("\n" + "=".repeat(70), "cyan");
  log("MIND EASE - FINAL API TESTING", "cyan");
  log("=".repeat(70), "cyan");
  log(`Node Server: ${NODE_SERVER_URL}`, "cyan");
  log(`ML Server: ${ML_SERVER_URL}`, "cyan");
  log("=".repeat(70), "cyan");

  const startTime = Date.now();

  try {
    await testMLServer();
    await testNodeServer();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Final Summary
    log("\n" + "=".repeat(70), "cyan");
    log("TEST SUMMARY", "cyan");
    log("=".repeat(70), "cyan");
    log(`Total Tests: ${testResults.passed + testResults.failed}`, "blue");
    log(`Passed: ${testResults.passed}`, "green");
    log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? "red" : "green");
    log(`Duration: ${duration}s`, "blue");

    if (testResults.errors.length > 0) {
      log("\nErrors Found:", "red");
      testResults.errors.forEach((error, index) => {
        log(`${index + 1}. ${error}`, "red");
      });
    }

    log("\n" + "=".repeat(70), "cyan");
    if (testResults.failed === 0) {
      log("✅ ALL TESTS PASSED!", "green");
    } else {
      log("⚠️  SOME TESTS FAILED - REVIEW ERRORS ABOVE", "yellow");
    }
    log("=".repeat(70), "cyan");
  } catch (error) {
    log(`\n✗ Test suite error: ${error.message}`, "red");
    console.error(error);
  }
}

runAllTests();

