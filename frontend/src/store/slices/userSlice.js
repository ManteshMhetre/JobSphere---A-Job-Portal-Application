import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE_URL from "../../config/api.js";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    isAuthenticated: false,
    user: {},
    error: null,
    message: null,
  },
  reducers: {
    registerRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
      state.message = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
      state.message = action.payload.message;
    },
    registerFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
      state.message = null;
    },
    loginRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
      state.message = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
      state.message = action.payload.message;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
      state.message = null;
    },
    fetchUserRequest(state, action) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    fetchUserSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    fetchUserFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },
    logoutSuccess(state, action) {
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    logoutFailed(state, action) {
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
      state.error = action.payload;
    },
    clearAllErrors(state, action) {
      state.error = null;
      state.user = state.user;
    },
  },
});

export const register = (data) => async (dispatch) => {
  dispatch(userSlice.actions.registerRequest());
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/register`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch(userSlice.actions.registerSuccess(response.data));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    dispatch(userSlice.actions.registerFailed(error.response.data.message));
  }
};

export const login = (data) => async (dispatch) => {
  dispatch(userSlice.actions.loginRequest());
  try {
    console.log("Attempting login with API endpoint:", `${API_BASE_URL}/user/login`);
    
    const response = await axios.post(
      `${API_BASE_URL}/user/login`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
        timeout: 15000 // 15 second timeout
      }
    );
    
    console.log("Login successful, response:", response.data);
    dispatch(userSlice.actions.loginSuccess(response.data));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    console.error("Login failed:", error);
    let errorMessage = "Login failed. Please try again.";
    
    if (error.response) {
      // The request was made and the server responded with a status code
      errorMessage = error.response.data.message || `Error: ${error.response.status}`;
      console.error("Server responded with error:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      errorMessage = "Server not responding. Please try again later.";
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
      errorMessage = error.message;
    }
    
    dispatch(userSlice.actions.loginFailed(errorMessage));
  }
};

export const getUser = () => async (dispatch) => {
  dispatch(userSlice.actions.fetchUserRequest());
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/getuser`,
      {
        withCredentials: true,
      }
    );
    dispatch(userSlice.actions.fetchUserSuccess(response.data.user));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    // Don't display authentication errors when checking logged-in status
    // Just set the state as not authenticated without error messages
    if (error.response && error.response.status === 400 && 
        error.response.data.message === "User is not authenticated.") {
      dispatch(userSlice.actions.fetchUserFailed(null));
    } else {
      dispatch(userSlice.actions.fetchUserFailed(error.response?.data?.message || "An error occurred"));
    }
  }
};
export const logout = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/logout`,
      {
        withCredentials: true,
      }
    );
    dispatch(userSlice.actions.logoutSuccess());
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error) {
    console.error("Logout failed:", error);
    // Still mark as logged out even if API call failed
    dispatch(userSlice.actions.logoutSuccess());
    dispatch(userSlice.actions.logoutFailed(error.response?.data?.message || "An error occurred during logout"));
  }
};

export const clearAllUserErrors = () => (dispatch) => {
  dispatch(userSlice.actions.clearAllErrors());
};

export default userSlice.reducer;
