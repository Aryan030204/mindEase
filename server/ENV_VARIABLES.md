# Environment Variables Reference

Complete list of all environment variables used in the MindEase backend server.

## Required Environment Variables

### 1. **MONGO_URI** (Required)
- **Description**: MongoDB connection string
- **Used in**: `server/src/config/db.js`
- **Example Values**:
  ```env
  # MongoDB Atlas (Cloud)
  MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mindease?retryWrites=true&w=majority
  
  # Local MongoDB
  MONGO_URI=mongodb://localhost:27017/mindease
  
  # MongoDB with authentication
  MONGO_URI=mongodb://username:password@localhost:27017/mindease?authSource=admin
  ```
- **Notes**: 
  - Replace `username`, `password`, and cluster details with your actual credentials
  - For MongoDB Atlas, ensure your IP is whitelisted
  - Database name is `mindease` (can be changed)

### 2. **JWT_SECRET** (Required)
- **Description**: Secret key for signing and verifying JWT tokens
- **Used in**: 
  - `server/src/services/jwt.service.js`
  - `server/src/middlewares/auth.middleware.js`
- **Example Values**:
  ```env
  # Generate a strong random string (recommended: 32+ characters)
  JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
  
  # Or use a generated secret
  JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
  ```
- **Notes**: 
  - **CRITICAL**: Use a strong, random secret in production
  - Minimum 32 characters recommended
  - Never commit this to version control
  - Generate using: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. **GEMINI_API_KEY** (Required for Chatbot)
- **Description**: Google Gemini API key for chatbot functionality
- **Used in**: `server/src/services/ai.service.js`
- **Example Values**:
  ```env
  GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  ```
- **Notes**: 
  - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Chatbot will return error message if not configured
  - Keep this secret and never commit to version control

### 4. **ML_SERVER_URL** (Required)
- **Description**: Base URL of the ML/Python server for mood predictions and recommendations
- **Used in**: `server/src/ml/apiClient.js`
- **Example Values**:
  ```env
  # Local development
  ML_SERVER_URL=http://localhost:8000
  
  # Production/Deployed ML server
  ML_SERVER_URL=https://your-ml-server-domain.com
  ML_SERVER_URL=http://your-ml-server-ip:8000
  ```
- **Notes**: 
  - Must include protocol (http:// or https://)
  - No trailing slash
  - Should match your deployed ML server URL

## Optional Environment Variables

### 5. **PORT** (Optional)
- **Description**: Port number for the Node.js server to listen on
- **Used in**: `server/src/server.js`
- **Default**: `5000`
- **Example Values**:
  ```env
  PORT=5000
  PORT=8080
  PORT=3000
  ```
- **Notes**: 
  - If not set, defaults to port 5000
  - Ensure the port is available and not blocked by firewall
  - For production, use standard ports (80 for HTTP, 443 for HTTPS with reverse proxy)

### 6. **CLIENT_URL** (Optional but Recommended)
- **Description**: Frontend application URL for CORS configuration
- **Used in**: `server/src/app.js`
- **Example Values**:
  ```env
  # Local development
  CLIENT_URL=http://localhost:3000
  
  # Production
  CLIENT_URL=https://your-frontend-domain.com
  CLIENT_URL=https://www.your-frontend-domain.com
  ```
- **Notes**: 
  - If not set, CORS may block frontend requests
  - Can be a comma-separated list for multiple origins
  - Should match your frontend deployment URL exactly

### 7. **JWT_EXPIRES_IN** (Optional)
- **Description**: JWT token expiration time
- **Used in**: `server/src/services/jwt.service.js`
- **Default**: `7d` (7 days)
- **Example Values**:
  ```env
  JWT_EXPIRES_IN=7d          # 7 days
  JWT_EXPIRES_IN=24h         # 24 hours
  JWT_EXPIRES_IN=1h          # 1 hour
  JWT_EXPIRES_IN=30m         # 30 minutes
  JWT_EXPIRES_IN=3600        # 3600 seconds
  ```
- **Notes**: 
  - Format: number + unit (s, m, h, d)
  - Common values: `1h`, `24h`, `7d`, `30d`
  - Shorter expiration = more secure but requires frequent re-login

### 8. **NODE_ENV** (Optional)
- **Description**: Environment mode (development, production, test)
- **Used in**: `server/src/middlewares/error.middleware.js`
- **Default**: Not set (treated as development)
- **Example Values**:
  ```env
  NODE_ENV=development
  NODE_ENV=production
  NODE_ENV=test
  ```
- **Notes**: 
  - `production`: Hides error stack traces from API responses
  - `development`: Shows full error details including stack traces
  - Affects error logging and debugging information

## Complete .env File Example

```env
# ============================================
# MindEase Backend Server - Environment Variables
# ============================================

# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mindease?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_EXPIRES_IN=7d

# CORS Configuration
CLIENT_URL=https://your-frontend-domain.com

# ML Server Configuration
ML_SERVER_URL=https://your-ml-server-domain.com

# Gemini API Configuration (for Chatbot)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Environment-Specific Examples

### Development (.env.development)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mindease
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:3000
ML_SERVER_URL=http://localhost:8000
GEMINI_API_KEY=your-dev-gemini-key
```

### Production (.env.production)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://prod-user:prod-pass@cluster.mongodb.net/mindease
JWT_SECRET=super-strong-production-secret-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=https://mindease.app
ML_SERVER_URL=https://ml.mindease.app
GEMINI_API_KEY=your-prod-gemini-key
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong secrets** for JWT_SECRET (32+ characters, random)
3. **Rotate secrets** periodically in production
4. **Use different keys** for development and production
5. **Restrict MongoDB access** by IP whitelist
6. **Use environment-specific .env files** (.env.development, .env.production)
7. **Validate all env variables** on server startup
8. **Use secret management services** (AWS Secrets Manager, Azure Key Vault, etc.) in production

## Validation Checklist

Before deploying, ensure:
- [ ] `MONGO_URI` is set and accessible
- [ ] `JWT_SECRET` is strong and unique
- [ ] `GEMINI_API_KEY` is valid (if using chatbot)
- [ ] `ML_SERVER_URL` points to your deployed ML server
- [ ] `CLIENT_URL` matches your frontend URL
- [ ] `NODE_ENV` is set to `production` for production
- [ ] All secrets are different from development values

## Troubleshooting

### "Database not connected" errors
- Check `MONGO_URI` is correct
- Verify MongoDB server is running/accessible
- Check network/firewall settings
- Verify credentials are correct

### "Invalid token" errors
- Verify `JWT_SECRET` is set correctly
- Ensure same secret is used for signing and verification
- Check token hasn't expired (verify `JWT_EXPIRES_IN`)

### CORS errors
- Verify `CLIENT_URL` matches frontend URL exactly
- Check protocol (http vs https)
- Ensure no trailing slashes
- Verify credentials: true is set in CORS config

### Chatbot not working
- Verify `GEMINI_API_KEY` is set and valid
- Check API key has proper permissions
- Verify network connectivity to Google API
- Check API quota/limits

### ML Server connection errors
- Verify `ML_SERVER_URL` is correct
- Ensure ML server is running and accessible
- Check network/firewall allows connection
- Verify ML server endpoints are working

