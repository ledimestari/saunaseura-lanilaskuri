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

export const getEventGoods = async (event) => {
  try {
    const response = await api.get(`/get_event_goods/?event=${event}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
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

// Create good for an event
export const createGood = async (event, goodName, goodPrice, payers) => {
  try {
    const response = await api.post(
      `http://192.168.1.180:8000/add_item_to_event/?event=${event}&item=${goodName}&price=${goodPrice}`,
      payers,
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
      "Error creating item:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete a good from an event
export const deleteItem = async (event, id) => {
  try {
    const response = await api.delete(
      `http://192.168.1.180:8000/remove_item_from_event/?event=${event}&id=${id}`,
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
      "Error deleting item:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update a good in an event
export const updateItemInEvent = async (
  event,
  itemId,
  newItem,
  newPrice,
  newPayers
) => {
  try {
    const response = await axios.put(
      `http://192.168.1.180:8000/update_item_in_event/`,
      newPayers,
      {
        params: {
          event: event,
          item_id: itemId,
          new_item: newItem,
          new_price: newPrice,
        },
        headers: {
          Authorization: `Bearer fbce26ff-2fbf-436d-9175-8ebf4f7f962b`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating item in event:",
      error.response?.data || error.message
    );
    throw error;
  }
};
