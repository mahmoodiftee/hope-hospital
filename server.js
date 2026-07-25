require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Expo } = require("expo-server-sdk");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const expo = new Expo();

const otpStorage = new Map();

const pushTokenStorage = new Map(); // userId -> expoPushToken

function generateOTP() {
  return "123456"; 
}

// ============= OTP ENDPOINTS =============

app.post("/api/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  console.log("Received OTP request for:", phoneNumber);

  if (!phoneNumber) {
    console.warn("Missing phone number in request");
    return res
      .status(400)
      .json({ success: false, message: "Phone number is required" });
  }

  let formattedPhone = phoneNumber.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "880" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("880")) {
    formattedPhone = "880" + formattedPhone;
  }
  formattedPhone = "+" + formattedPhone;

  console.log("Formatted phone number:", formattedPhone);

  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000;
  otpStorage.set(formattedPhone, {
    otp,
    expiry: otpExpiry,
    attempts: 0,
  });

  console.log(
    "Generated OTP:",
    otp,
    " | Expires at:",
    new Date(otpExpiry).toISOString()
  );

  try {
    console.log(`📱 [MOCK SMS] Sending to ${formattedPhone}: Your verification code is ${otp}. It is valid for 10 minutes.`);
    
    const mockMessageSid = `SM${Math.random().toString(36).substr(2, 9)}`;
    
    console.log("Message sent successfully (MOCK):", {
      sid: mockMessageSid,
      to: formattedPhone,
      status: "sent",
      otp,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      phoneNumber: formattedPhone,
      sid: mockMessageSid,
      otp: otp,
      note: "This is a mock SMS with fixed OTP: 123456"
    });
  } catch (error) {
    console.error("Failed to send OTP:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

app.get("/api/get-otp/:phoneNumber", (req, res) => {
  const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.SHOW_OTP_IN_RESPONSE === 'true';
  
  if (!isDevelopment) {
    return res.status(404).json({ success: false, message: "Endpoint not available in production" });
  }

  const { phoneNumber } = req.params;
  
  let formattedPhone = phoneNumber.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "880" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("880")) {
    formattedPhone = "880" + formattedPhone;
  }
  formattedPhone = "+" + formattedPhone;

  const otpData = otpStorage.get(formattedPhone);

  if (!otpData) {
    return res.status(404).json({ 
      success: false, 
      message: "No OTP found for this phone number" 
    });
  }

  if (Date.now() > otpData.expiry) {
    otpStorage.delete(formattedPhone);
    return res.status(400).json({ 
      success: false, 
      message: "OTP has expired" 
    });
  }

  return res.json({
    success: true,
    phoneNumber: formattedPhone,
    otp: otpData.otp,
    expiresAt: new Date(otpData.expiry).toISOString(),
    attempts: otpData.attempts
  });
});

app.post("/api/verify-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number and OTP are required" });
  }

  let formattedPhone = phoneNumber.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "880" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("880")) {
    formattedPhone = "880" + formattedPhone;
  }
  formattedPhone = "+" + formattedPhone;

  const otpData = otpStorage.get(formattedPhone);

  if (!otpData) {
    return res
      .status(400)
      .json({ success: false, message: "No OTP request found" });
  }

  if (Date.now() > otpData.expiry) {
    otpStorage.delete(formattedPhone);
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  if (otpData.otp !== otp) {
    otpData.attempts += 1;
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  otpStorage.delete(formattedPhone);
  return res.json({ success: true, message: "OTP verified successfully" });
});

// ============= PUSH NOTIFICATION ENDPOINTS =============

/**
 * Register push token for a user
 */
app.post("/api/register-push-token", (req, res) => {
  const { userId, expoPushToken, platform } = req.body;

  if (!userId || !expoPushToken) {
    return res.status(400).json({ 
      success: false, 
      message: "userId and expoPushToken are required" 
    });
  }

  // Validate Expo Push Token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid Expo Push Token format" 
    });
  }

  // Store the token (in production, save to database)
  pushTokenStorage.set(userId, {
    token: expoPushToken,
    platform: platform || 'unknown',
    registeredAt: new Date().toISOString(),
  });

  console.log(`Registered push token for user ${userId} on ${platform}`);

  return res.json({ 
    success: true, 
    message: "Push token registered successfully",
    userId 
  });
});

/**
 * Verify if a user has a registered push token
 */
app.get("/api/verify-push-token/:userId", (req, res) => {
  const { userId } = req.params;

  const tokenData = pushTokenStorage.get(userId);

  if (tokenData) {
    return res.json({
      success: true,
      registered: true,
      platform: tokenData.platform,
      registeredAt: tokenData.registeredAt,
    });
  } else {
    return res.json({
      success: true,
      registered: false,
    });
  }
});

/**
 * Send push notification to a specific user
 * Maintains the same interface as native-notify
 */
app.post("/api/send-notification", async (req, res) => {
  const { userId, title, message, data } = req.body;

  console.log(`Received notification request for user: ${userId}`);

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: "userId is required" 
    });
  }

  // Get user's push token
  const tokenData = pushTokenStorage.get(userId);

  if (!tokenData) {
    console.log(`No push token found for user ${userId}`);
    return res.status(404).json({ 
      success: false, 
      message: "User not registered for push notifications" 
    });
  }

  const expoPushToken = tokenData.token;

  // Validate token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.log(`Invalid push token for user ${userId}`);
    return res.status(400).json({ 
      success: false, 
      message: "Invalid Expo Push Token" 
    });
  }

  try {
    // Construct the push notification message
    const pushMessage = {
      to: expoPushToken,
      sound: "default",
      title: title || "Hope Hospital",
      body: message || "You have a new update!",
      data: data || {},
      priority: "high",
      channelId: "default",
    };

    console.log(`📨 Sending push notification:`, {
      to: userId,
      title: pushMessage.title,
      body: pushMessage.body,
    });

    // Send the notification
    const tickets = await expo.sendPushNotificationsAsync([pushMessage]);

    console.log(`Push notification sent successfully to ${userId}`);

    // Check for errors in tickets
    const hasErrors = tickets.some(ticket => ticket.status === 'error');
    
    if (hasErrors) {
      console.log(`Some notifications had errors:`, tickets);
    }

    return res.json({ 
      success: true, 
      tickets,
      message: "Notification sent successfully" 
    });

  } catch (error) {
    console.error("Notification error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * Send push notification to multiple users
 */
app.post("/api/send-bulk-notifications", async (req, res) => {
  const { userIds, title, message, data } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "userIds array is required" 
    });
  }

  try {
    const messages = [];
    const notFoundUsers = [];

    // Collect all valid push tokens
    for (const userId of userIds) {
      const tokenData = pushTokenStorage.get(userId);
      
      if (tokenData && Expo.isExpoPushToken(tokenData.token)) {
        messages.push({
          to: tokenData.token,
          sound: "default",
          title: title || "Hope Hospital",
          body: message || "You have a new update!",
          data: data || {},
          priority: "high",
          channelId: "default",
        });
      } else {
        notFoundUsers.push(userId);
      }
    }

    if (messages.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No valid push tokens found for the provided users" 
      });
    }

    console.log(`📨 Sending ${messages.length} bulk notifications`);

    // Send notifications in chunks (Expo recommends max 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...chunkTickets);
    }

    console.log(`Bulk notifications sent successfully`);

    return res.json({ 
      success: true, 
      tickets,
      sent: messages.length,
      notFound: notFoundUsers.length,
      notFoundUsers 
    });

  } catch (error) {
    console.error("Bulk notification error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * Get all registered users (for debugging)
 */
app.get("/api/registered-users", (req, res) => {
  const users = Array.from(pushTokenStorage.entries()).map(([userId, data]) => ({
    userId,
    platform: data.platform,
    registeredAt: data.registeredAt,
  }));

  return res.json({
    success: true,
    count: users.length,
    users,
  });
});

// ============= HEALTH CHECK =============

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mockMode: true,
    pushNotifications: "enabled",
    registeredUsers: pushTokenStorage.size,
  });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`Push notifications: ENABLED`);
  console.log(`OTP Mode: MOCK (fixed OTP: 123456)`);
});

module.exports = app;