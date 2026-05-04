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
    
    <p>Or copy this token:</p>
    <code style="background:#f4f4f4;padding:5px;border-radius:4px;">
      ${token}
    </code>

    <p>This link expires in 1 hour.</p>
    <p>If you did not request this, ignore this email.</p>
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