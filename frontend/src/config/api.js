// API Base URL configuration
// Uses environment variable in production, falls back to localhost for development

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export default API_BASE_URL;
