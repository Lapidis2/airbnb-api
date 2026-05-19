export const welcomeEmail = (name: string, role: string) => {
  return `
  <div style="font-family:Arial;padding:20px;">
    <h1 style="color:#FF5A5F;">Welcome ${name} 👋</h1>

    <p>You are registered as <b>${role}</b>.</p>

    ${
      role === "HOST"
        ? "<p>Start by creating your first listing 🏡</p>"
        : "<p>Explore amazing listings around you 🌍</p>"
    }

    <a href="https://jeanpierre-portfolio.netlify.app/"
       style="padding:10px 20px;background:#FF5A5F;color:white;text-decoration:none;border-radius:5px;">
      Get Started
    </a>
  </div>
  `;
};



export const passwordResetEmail = (
  name: string,
  resetLink: string,
  deepLink: string,
  token: string
) => {
  return `
  <div style="font-family:Arial;padding:20px;">
    <h2>Hi ${name}</h2>

    <p>Click below to reset your password:</p>

    <a href="${resetLink}"
       style="padding:10px 20px;background:red;color:#fff;text-decoration:none;border-radius:5px;">
      Reset Password
    </a>
    <p style="margin-top:10px;">
  Open in app: 
  <a href="${deepLink}">
    Click here
  </a>
</p>
    <p>Or copy this token:</p>
    <code style="background:#f4f4f4;padding:5px;border-radius:4px;">
      ${token}
    </code>

    <p>This link expires in 1 hour.</p>
    <p>If you did not request this, ignore this email.</p>
  </div>
  `;
};



export const bookingRequestEmail = (
  hostName: string,
  guestName: string,
  listingTitle: string,
  checkIn: string,
  checkOut: string
) => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2>New Booking Request</h2>
    <p>Hi ${hostName},</p>
    <p><strong>${guestName}</strong> has requested to book your listing: <strong>${listingTitle}</strong></p>
    
    <p><strong>Check-in:</strong> ${checkIn}</p>
    <p><strong>Check-out:</strong> ${checkOut}</p>
    
    <p>Please log in to your dashboard to approve or reject this request.</p>
  </div>
  `;
};

export const bookingApprovedEmail = (
  guestName: string,
  listingTitle: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
) => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Booking Approved ✅</h2>
    <p>Hi ${guestName},</p>
    <p>Your booking for <strong>${listingTitle}</strong> has been approved!</p>
    
    <p>Check-in: ${checkIn}</p>
    <p>Check-out: ${checkOut}</p>
    <h3>Total: $${totalPrice}</h3>
    
    <p>You can now proceed with payment.</p>
  </div>
  `;
};

export const bookingRejectedEmail = (
  guestName: string,
  listingTitle: string
) => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Booking Request Rejected</h2>
    <p>Hi ${guestName},</p>
    <p>Unfortunately, your booking request for <strong>${listingTitle}</strong> has been rejected by the host.</p>
    <p>You may try booking different dates or another listing.</p>
  </div>
  `;
};

export const paymentSuccessEmail = (
  guestName: string,
  listingTitle: string,
  totalPrice: number
) => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Payment Successful 🎉</h2>
    <p>Hi ${guestName},</p>
    <p>Your payment of <strong>$${totalPrice}</strong> for <strong>${listingTitle}</strong> has been received.</p>
    <p>Thank you for booking with us!</p>
  </div>
  `;
};

export const bookingConfirmationEmail = (
  name: string,
  title: string,
  location: string,
  checkIn: string,
  checkOut: string,
  price: number
) => {
  return `
  <div style="font-family:Arial;padding:20px;">
    <h2>Booking Confirmed 🎉</h2>

    <p>Hi ${name}, your booking is confirmed.</p>

    <p><b>${title}</b></p>
    <p>${location}</p>

    <p>Check-in: ${checkIn}</p>
    <p>Check-out: ${checkOut}</p>

    <h3>Total: $${price}</h3>

    <p>Free cancellation within policy period.</p>
  </div>
  `;
};