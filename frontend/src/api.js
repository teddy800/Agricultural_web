// API Service for AgriConnect Frontend
// Centralized API communication layer

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || "Request failed",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || "Network error",
      0,
      { originalError: error }
    );
  }
}

// ==================== HEALTH & STATS ====================

export async function checkHealth() {
  return request("/health");
}

export async function getStats() {
  return request("/stats");
}

// ==================== USER ENDPOINTS ====================

export async function registerUser(userData) {
  return request("/users/register", {
    method: "POST",
    body: userData,
  });
}

export async function getUser(userId) {
  return request(`/users/${userId}`);
}

export async function updateUser(userId, updates) {
  return request(`/users/${userId}`, {
    method: "PUT",
    body: updates,
  });
}

// ==================== LISTINGS ENDPOINTS ====================

export async function getListings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  
  const query = params.toString();
  return request(`/listings${query ? `?${query}` : ""}`);
}

export async function getListing(listingId) {
  return request(`/listings/${listingId}`);
}

export async function createListing(listingData) {
  return request("/listings", {
    method: "POST",
    body: listingData,
  });
}

export async function updateListing(listingId, updates) {
  return request(`/listings/${listingId}`, {
    method: "PUT",
    body: updates,
  });
}

export async function deleteListing(listingId) {
  return request(`/listings/${listingId}`, {
    method: "DELETE",
  });
}

// ==================== INQUIRIES ENDPOINTS ====================

export async function getInquiries(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  
  const query = params.toString();
  return request(`/inquiries${query ? `?${query}` : ""}`);
}

export async function getInquiry(inquiryId) {
  return request(`/inquiries/${inquiryId}`);
}

export async function createInquiry(inquiryData) {
  return request("/inquiries", {
    method: "POST",
    body: inquiryData,
  });
}

export async function updateInquiryStatus(inquiryId, status, responseMessage = null) {
  return request(`/inquiries/${inquiryId}/status`, {
    method: "PUT",
    body: { status, responseMessage },
  });
}

// ==================== MARKET PRICES ENDPOINTS ====================

export async function getMarketPrices(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  
  const query = params.toString();
  return request(`/market-prices${query ? `?${query}` : ""}`);
}

export async function addMarketPrice(priceData) {
  return request("/market-prices", {
    method: "POST",
    body: priceData,
  });
}

// ==================== MESSAGES ENDPOINTS ====================

export async function getMessages(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  
  const query = params.toString();
  return request(`/messages${query ? `?${query}` : ""}`);
}

export async function sendMessage(messageData) {
  return request("/messages", {
    method: "POST",
    body: messageData,
  });
}

export async function markMessageAsRead(messageId) {
  return request(`/messages/${messageId}/read`, {
    method: "PUT",
  });
}

// ==================== WEATHER ENDPOINT ====================

export async function getWeather(location = "Haramaya") {
  return request(`/weather?location=${encodeURIComponent(location)}`);
}

// ==================== ERROR UTILITIES ====================

export function isApiError(error) {
  return error instanceof ApiError;
}

export function getErrorMessage(error) {
  if (isApiError(error)) {
    return error.message;
  }
  return error.message || "An unexpected error occurred";
}

// Export ApiError for type checking
export { ApiError };
