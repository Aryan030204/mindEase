import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const ML_URL = process.env.ML_SERVER_URL || "http://localhost:8000";

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

async function testEndpoint(name, method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url,
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    if (data) config.data = data;

    const response = await axios(config);
    log(`✓ ${name} - Status: ${response.status}`, "green");
    if (response.data && Object.keys(response.data).length <= 3) {
      log(`  Response: ${JSON.stringify(response.data)}`, "blue");
    }
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    let errorMsg = "Unknown error";
    let status = 0;
    
    if (error.code === "ECONNREFUSED") {
      errorMsg = `Connection refused - Server not running on ${url}`;
    } else if (error.response) {
      errorMsg = error.response.data || error.message;
      status = error.response.status;
    } else {
      errorMsg = error.message;
    }
    
    log(`✗ ${name} - Status: ${status}`, "red");
    log(`  Error: ${errorMsg}`, "red");
    return { success: false, error: errorMsg, status };
  }
}

async function testAll() {
  log("\n" + "=".repeat(60), "blue");
  log("INDIVIDUAL API ENDPOINT TESTING", "blue");
  log("=".repeat(60), "blue");

  let authToken = "";
  let userId = "";
  let moodLogId = "";
  let recommendationId = "";

  // ========== ML SERVER TESTS ==========
  log("\n" + "-".repeat(60), "yellow");
  log("ML SERVER ENDPOINTS", "yellow");
  log("-".repeat(60), "yellow");

  await testEndpoint("ML Health", "GET", `${ML_URL}/`);
  await testEndpoint("ML Predict", "POST", `${ML_URL}/predict`, {
    text: "I feel great today!",
  });
  await testEndpoint("ML Recommend", "POST", `${ML_URL}/recommend`, {
    moodScore: 4,
    emotionTag: "sad",
  });
  await testEndpoint("ML Chat", "POST", `${ML_URL}/chat`, {
    message: "I'm feeling anxious",
  });

  // ========== BACKEND HEALTH ==========
  log("\n" + "-".repeat(60), "yellow");
  log("BACKEND HEALTH ENDPOINTS", "yellow");
  log("-".repeat(60), "yellow");

  await testEndpoint("Health Check", "GET", `${BASE_URL}/health`);
  await testEndpoint("API Info", "GET", `${BASE_URL}/api`);

  // ========== AUTH TESTS ==========
  log("\n" + "-".repeat(60), "yellow");
  log("AUTHENTICATION ENDPOINTS", "yellow");
  log("-".repeat(60), "yellow");

  const signupEmail = `test${Date.now()}@example.com`;
  const signupResult = await testEndpoint(
    "Signup",
    "POST",
    `${BASE_URL}/api/auth/signup`,
    {
      firstName: "Test",
      lastName: "User",
      email: signupEmail,
      password: "testpass123",
    }
  );

  if (signupResult.success) {
    authToken = signupResult.data.token;
    userId = signupResult.data.user.id;
    log(`  Token: ${authToken.substring(0, 30)}...`, "blue");
  }

  await testEndpoint(
    "Login",
    "POST",
    `${BASE_URL}/api/auth/login`,
    {
      email: signupEmail,
      password: "testpass123",
    }
  );

  await testEndpoint("Logout", "POST", `${BASE_URL}/api/auth/logout`, null, authToken);

  // ========== USER PROFILE TESTS ==========
  if (authToken) {
    log("\n" + "-".repeat(60), "yellow");
    log("USER PROFILE ENDPOINTS", "yellow");
    log("-".repeat(60), "yellow");

    await testEndpoint(
      "Get Profile",
      "GET",
      `${BASE_URL}/api/user/profile`,
      null,
      authToken
    );

    await testEndpoint(
      "Update Profile",
      "PUT",
      `${BASE_URL}/api/user/profile`,
      {
        firstName: "Updated",
        preferences: { exercise: true, music: false, meditation: true },
      },
      authToken
    );
  }

  // ========== MOOD TESTS ==========
  if (authToken) {
    log("\n" + "-".repeat(60), "yellow");
    log("MOOD ENDPOINTS", "yellow");
    log("-".repeat(60), "yellow");

    const moodResult = await testEndpoint(
      "Add Mood Log",
      "POST",
      `${BASE_URL}/api/mood/log`,
      {
        moodScore: 7,
        emotionTag: "happy",
        notes: "Feeling great today!",
        activityDone: false,
      },
      authToken
    );

    if (moodResult.success) {
      moodLogId = moodResult.data.log._id;
    }

    await testEndpoint(
      "Get Mood History",
      "GET",
      `${BASE_URL}/api/mood/history`,
      null,
      authToken
    );

    await testEndpoint(
      "Get Mood Analytics",
      "GET",
      `${BASE_URL}/api/mood/analytics?period=week`,
      null,
      authToken
    );
  }

  // ========== RECOMMENDATION TESTS ==========
  if (authToken) {
    log("\n" + "-".repeat(60), "yellow");
    log("RECOMMENDATION ENDPOINTS", "yellow");
    log("-".repeat(60), "yellow");

    await testEndpoint(
      "General Recommendations",
      "GET",
      `${BASE_URL}/api/recommendations/general`
    );

    const recResult = await testEndpoint(
      "Personalized Recommendations",
      "GET",
      `${BASE_URL}/api/recommendations/personalized`,
      null,
      authToken
    );

    if (recResult.success && recResult.data.recommendation) {
      recommendationId = recResult.data.recommendation._id;
      await testEndpoint(
        "Update Recommendation Status",
        "PATCH",
        `${BASE_URL}/api/recommendations/${recommendationId}/status`,
        { status: "accepted" },
        authToken
      );
    }
  }

  // ========== CHAT TESTS ==========
  if (authToken) {
    log("\n" + "-".repeat(60), "yellow");
    log("CHAT ENDPOINTS", "yellow");
    log("-".repeat(60), "yellow");

    await testEndpoint(
      "Send Chat Query",
      "POST",
      `${BASE_URL}/api/chat/query`,
      { message: "I'm feeling anxious today" },
      authToken
    );

    await testEndpoint(
      "Get Chat History",
      "GET",
      `${BASE_URL}/api/chat/history`,
      null,
      authToken
    );
  }

  // ========== RESOURCE TESTS ==========
  log("\n" + "-".repeat(60), "yellow");
  log("RESOURCE ENDPOINTS", "yellow");
  log("-".repeat(60), "yellow");

  await testEndpoint("Get All Resources", "GET", `${BASE_URL}/api/resources/all`);
  await testEndpoint(
    "Get Resources by Category",
    "GET",
    `${BASE_URL}/api/resources/articles`
  );

  log("\n" + "=".repeat(60), "blue");
  log("TESTING COMPLETE", "blue");
  log("=".repeat(60), "blue");
}

// Wait a bit for servers to start, then test
setTimeout(() => {
  testAll().catch(console.error);
}, 2000);

