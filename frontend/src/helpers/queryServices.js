import axios from "axios";

// Create an axios instance with the base URL
export const api = axios.create({
  baseURL: `http://nuc.ihanakangas.fi:8000`,
});

// Verify main page password and acquire token
export const authCheck = async (password) => {
  try {
    const response = await api.get("/auth", {
      params: { password: password },
    });

    // Store the new token from the response
    const newToken = response.data.token;
    localStorage.setItem("authToken", newToken);
    console.log("New token stored:", newToken);

    return response.data;
  } catch (error) {
    console.error(
      "Authentication failed:",
      error.response?.data?.detail || error.message
    );
    throw error;
  }
};

// Check database health
export const healthCheck = async () => {
  try {
    const response = await api.get("/health", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
      `/add_item_to_event/?event=${event}&item=${goodName}&price=${goodPrice}`,
      payers,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
      `/remove_item_from_event/?event=${event}&id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
    const response = await api.put(`/update_item_in_event/`, newPayers, {
      params: {
        event: event,
        item_id: itemId,
        new_item: newItem,
        new_price: newPrice,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating item in event:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadReceiptAndProcess = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/process-receipt/", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "multipart/form-data",
        accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Create multiple goods for an event
export const createGoods = async (event, items) => {
  try {
    const response = await api.post(
      `/add_items_to_event/?event=${event}`,
      items,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding items to event:",
      error.response?.data || error.message
    );
    throw error;
  }
};
