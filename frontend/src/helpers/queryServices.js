import axios from "axios";

// Create an axios instance with the base URL
export const api = axios.create({
  baseURL: `http://nuc.ihanakangas.fi:8000`,
});

// Get api key from .env. Note that this is handled differently in vite.
const apiKey = import.meta.env.VITE_API_KEY;

// Verify main page password
export const authCheck = async (password) => {
  try {
    const response = await api.get("/auth", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: { password: password },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check database health
export const healthCheck = async () => {
  try {
    const response = await api.get("/health", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Authorization failed:",
      error.response?.data || error.message
    );
    throw new Error("Authorization failed");
  }
};

// Get events
export const getEvents = async () => {
  try {
    const response = await api.get("/get_events", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Authorization failed:",
      error.response?.data || error.message
    );
    throw new Error("Authorization failed");
  }
};

// Create event
export const createEvent = async (event_name, description) => {
  try {
    const response = await api.post(
      "/create_event",
      {
        event_name: event_name,
        description: description,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating event:",
      error.response?.data || error.message
    );
    throw error;
  }
};
