import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const API_BASE = "http://localhost:8080"
const ML_BASE = "http://localhost:8000"

let authToken = ""
let testUserId = ""

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testAPI(name, method, url, data = null, headers = {}) {
  try {
    const config = { method, url, headers }
    if (data) config.data = data
    
    const response = await axios(config)
    log(`✓ ${name} - Status: ${response.status}`, "green")
    return { success: true, data: response.data }
  } catch (error) {
    const status = error.response?.status || "Error"
    const message = error.response?.data?.message || error.message
    log(`✗ ${name} - Status: ${status}`, "red")
    log(`  Error: ${message}`, "red")
    return { success: false, error: message }
  }
}

async function runTests() {
  log("\n" + "=".repeat(70), "cyan")
  log("MIND EASE - LOCAL API TESTING", "cyan")
  log("=".repeat(70), "cyan")
  log(`Node Server: ${API_BASE}`, "cyan")
  log(`ML Server: ${ML_BASE}`, "cyan")
  log("=".repeat(70) + "\n", "cyan")

  const results = { passed: 0, failed: 0, tests: [] }

  // Test ML Server
  log("\n" + "=".repeat(70), "blue")
  log("TESTING ML SERVER", "blue")
  log("=".repeat(70), "blue")

  let result = await testAPI("ML Server Health", "GET", `${ML_BASE}/`)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  result = await testAPI(
    "ML Sentiment Prediction",
    "POST",
    `${ML_BASE}/predict`,
    { text: "I feel amazing today! Everything is going great!" }
  )
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  result = await testAPI(
    "ML Recommendations",
    "POST",
    `${ML_BASE}/recommend`,
    { moodScore: 4, emotionTag: "sad" }
  )
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Test Node Server
  log("\n" + "=".repeat(70), "blue")
  log("TESTING NODE SERVER", "blue")
  log("=".repeat(70), "blue")

  // Health Check
  result = await testAPI("Health Check", "GET", `${API_BASE}/health`)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Signup
  const testEmail = `test${Date.now()}@example.com`
  result = await testAPI(
    "User Signup",
    "POST",
    `${API_BASE}/api/auth/signup`,
    {
      firstName: "Test",
      lastName: "User",
      email: testEmail,
      password: "testpass123",
    }
  )
  results.tests.push(result)
  if (result.success && result.data.token) {
    authToken = result.data.token
    testUserId = result.data.user?.id
    log(`  Token received: ${authToken.substring(0, 20)}...`, "yellow")
  }
  result.success ? results.passed++ : results.failed++

  // Login
  result = await testAPI(
    "User Login",
    "POST",
    `${API_BASE}/api/auth/login`,
    {
      email: testEmail,
      password: "testpass123",
    }
  )
  results.tests.push(result)
  if (result.success && result.data.token) {
    authToken = result.data.token
  }
  result.success ? results.passed++ : results.failed++

  const headers = { Authorization: `Bearer ${authToken}` }

  // Get Profile
  result = await testAPI("Get Profile", "GET", `${API_BASE}/api/user/profile`, null, headers)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Add Mood Log
  result = await testAPI(
    "Add Mood Log",
    "POST",
    `${API_BASE}/api/mood/log`,
    {
      moodScore: 7,
      emotionTag: "happy",
      notes: "Feeling great!",
      activityDone: false,
    },
    headers
  )
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Get Mood History
  result = await testAPI("Get Mood History", "GET", `${API_BASE}/api/mood/history`, null, headers)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Get Mood Analytics
  result = await testAPI("Get Mood Analytics (Week)", "GET", `${API_BASE}/api/mood/analytics?period=week`, null, headers)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  result = await testAPI("Get Mood Analytics (Month)", "GET", `${API_BASE}/api/mood/analytics?period=month`, null, headers)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Get Recommendations
  result = await testAPI("Get General Recommendations", "GET", `${API_BASE}/api/recommendations/general`)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  result = await testAPI("Get Personalized Recommendations", "GET", `${API_BASE}/api/recommendations/personalized`, null, headers)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Chat
  result = await testAPI(
    "Send Chat Query",
    "POST",
    `${API_BASE}/api/chat/query`,
    { message: "I'm feeling anxious today. What can I do?" },
    headers
  )
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  result = await testAPI("Get Chat History", "GET", `${API_BASE}/api/chat/history`, null, headers)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Resources
  result = await testAPI("Get All Resources", "GET", `${API_BASE}/api/resources/all`)
  results.tests.push(result)
  result.success ? results.passed++ : results.failed++

  // Summary
  log("\n" + "=".repeat(70), "cyan")
  log("TEST SUMMARY", "cyan")
  log("=".repeat(70), "cyan")
  log(`Total Tests: ${results.passed + results.failed}`, "cyan")
  log(`Passed: ${results.passed}`, "green")
  log(`Failed: ${results.failed}`, results.failed > 0 ? "red" : "green")
  log("=".repeat(70), "cyan")

  if (results.failed === 0) {
    log("\n✅ ALL TESTS PASSED!", "green")
  } else {
    log("\n⚠️  SOME TESTS FAILED - REVIEW ERRORS ABOVE", "yellow")
  }
  log("=".repeat(70) + "\n", "cyan")
}

runTests().catch(console.error)

