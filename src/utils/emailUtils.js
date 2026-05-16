/**
 * Dummy email utility for sending notifications
 */

export const sendMembershipPurchaseEmail = async (user, membership) => {
  console.log(`[EMAIL] To: ${user.email} - Subject: Membership Activated!`);
  console.log(`Hi ${user.name}, your ${membership.membershipType} membership is now active until ${membership.expiryDate}.`);
};

export const sendMembershipUpgradeEmail = async (user, membership) => {
  console.log(`[EMAIL] To: ${user.email} - Subject: Membership Upgraded!`);
  console.log(`Hi ${user.name}, your membership has been upgraded to ${membership.membershipType}.`);
};

export const sendMembershipRenewEmail = async (user, membership) => {
  console.log(`[EMAIL] To: ${user.email} - Subject: Membership Renewed!`);
  console.log(`Hi ${user.name}, your membership has been renewed. New expiry: ${membership.expiryDate}.`);
};

export const sendMembershipExpiryReminder = async (user, membership) => {
  console.log(`[EMAIL] To: ${user.email} - Subject: Membership Expiring Soon!`);
  console.log(`Hi ${user.name}, your membership is expiring on ${membership.expiryDate}. Renew now to keep your benefits!`);
};

export const sendRegistrationConfirmationEmail = async (registration, event) => {
    console.log(`[EMAIL] To: ${registration.email} - Subject: Registration Confirmed!`);
    console.log(`Hi ${registration.fullName}, you are registered for ${event.title} on ${event.eventDate}.`);
};
