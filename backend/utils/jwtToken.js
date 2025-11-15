export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  
  // Set cookie expiration (default to 7 days if not set)
  const cookieExpireDays = process.env.COOKIE_EXPIRE || 7;
  
  const options = {
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site cookie in production
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};
