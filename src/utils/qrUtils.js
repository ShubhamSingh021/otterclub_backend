import QRCode from "qrcode";

/**
 * Generate a QR code as a Data URI
 * @param {string} text - The text/data to encode in the QR code
 * @returns {Promise<string>} - Base64 Data URI of the QR code
 */
export const generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 400,
      margin: 2,
    });
  } catch (err) {
    console.error("QR_GENERATE_ERROR:", err);
    throw err;
  }
};

/**
 * Generate membership QR data
 * @param {Object} user - User object
 * @param {Object} membership - Membership object
 * @returns {string} - JSON string for the QR code
 */
export const getMembershipQRData = (user, membership) => {
  return JSON.stringify({
    type: "membership",
    userId: user._id,
    userName: user.name,
    membershipType: membership.membershipType,
    expiryDate: membership.expiryDate,
    status: membership.membershipStatus
  });
};

/**
 * Generate event registration QR data
 * @param {Object} registration - Registration object
 * @param {Object} event - Event object
 * @returns {string} - JSON string for the QR code
 */
export const getEventTicketQRData = (registration, event) => {
  return JSON.stringify({
    type: "event_ticket",
    registrationId: registration._id,
    bookingId: registration.bookingId,
    userName: registration.userName,
    eventTitle: event.title,
    eventDate: event.eventDate,
    status: registration.paymentStatus,
    attendance: registration.attendanceStatus || "not_marked"
  });
};
