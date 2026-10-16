// Request validation middleware

export function validateUserRegistration(req, res, next) {
  const { name, email, phone, accountType } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Valid email is required");
  }

  if (!phone || !/^\+?251[0-9]{9}$/.test(phone.replace(/\s/g, ""))) {
    errors.push("Valid Ethiopian phone number is required (+251XXXXXXXXX)");
  }

  if (!accountType || !["farmer", "buyer", "trader", "admin"].includes(accountType)) {
    errors.push("Account type must be: farmer, buyer, trader, or admin");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
}

export function validateListing(req, res, next) {
  const { sellerId, cropName, quantity, unit, pricePerUnit, region, title } = req.body;
  const errors = [];

  if (!sellerId || isNaN(sellerId)) {
    errors.push("Valid seller ID is required");
  }

  if (!cropName || cropName.trim().length < 2) {
    errors.push("Crop name is required");
  }

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    errors.push("Valid quantity (> 0) is required");
  }

  if (!unit || !["quintal", "kg", "ton", "piece", "bag"].includes(unit)) {
    errors.push("Unit must be: quintal, kg, ton, piece, or bag");
  }

  if (!pricePerUnit || isNaN(pricePerUnit) || pricePerUnit <= 0) {
    errors.push("Valid price per unit (> 0) is required");
  }

  if (!region || region.trim().length < 2) {
    errors.push("Region is required");
  }

  if (!title || title.trim().length < 5) {
    errors.push("Title must be at least 5 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
}

export function validateInquiry(req, res, next) {
  const { listingId, buyerId, quantity } = req.body;
  const errors = [];

  if (!listingId || isNaN(listingId)) {
    errors.push("Valid listing ID is required");
  }

  if (!buyerId || isNaN(buyerId)) {
    errors.push("Valid buyer ID is required");
  }

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    errors.push("Valid quantity (> 0) is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
}

export function validateMessage(req, res, next) {
  const { senderId, receiverId, message } = req.body;
  const errors = [];

  if (!senderId || isNaN(senderId)) {
    errors.push("Valid sender ID is required");
  }

  if (!receiverId || isNaN(receiverId)) {
    errors.push("Valid receiver ID is required");
  }

  if (!message || message.trim().length < 1) {
    errors.push("Message content is required");
  }

  if (message && message.length > 5000) {
    errors.push("Message must be less than 5000 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  next();
}
