// Base url for backend
const BACKEND_BASE_URL = "http://nuc.ihanakangas.fi:8000";

// Verify main page password and acquire token
export const authCheck = async (password) => {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/auth?password=${password}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data = await response.json();

    // Store the new token from the response
    const newToken = data.token;
    localStorage.setItem("authToken", newToken);
    console.log("New token stored:", newToken);

    return data;
  } catch (error) {
    console.error("Authentication failed:", error.message);
    throw error;
  }
};

// Check database health
export const healthCheck = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
    });
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Authorization failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authorization failed:", error.message);
    throw new Error("Authorization failed");
  }
};

// Get events
export const getEvents = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/get_events`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        accept: "application/json",
      },
    });
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Authorization failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authorization failed:", error.message);
    throw new Error("Authorization failed");
  }
};

// Create event
export const createEvent = async (event_name, description) => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/create_event`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: event_name,
        description: description,
      }),
    });
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Error creating event");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating event:", error.message);
    throw error;
  }
};

// Get good for an event
export const getEventGoods = async (event) => {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/get_event_goods/?event=${event}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          accept: "application/json",
        },
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Authorization failed");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authorization failed:", error.message);
    throw new Error("Authorization failed");
  }
};

// Create good for an event
export const createGood = async (event, goodName, goodPrice, payers) => {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/add_item_to_event/?event=${event}&item=${goodName}&price=${goodPrice}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payers),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Error creating item");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating item:", error.message);
    throw error;
  }
};

// Delete a good from an event
export const deleteItem = async (event, id) => {
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/remove_item_from_event/?event=${event}&id=${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Error deleting item");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting item:", error.message);
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
    const response = await fetch(
      `${BACKEND_BASE_URL}/update_item_in_event/?event=${event}&item_id=${itemId}&new_item=${newItem}&new_price=${newPrice}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPayers),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      throw new Error("Error updating item in event");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating item in event:", error.message);
    throw error;
  }
};

// Upload the receipt to the backend and wait for it to get processed
export const uploadReceiptAndProcess = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BACKEND_BASE_URL}/process-receipt/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        accept: "application/json",
      },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }

    if (!response.ok) {
      throw new Error("Error uploading file");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
};

// Create multiple goods for an event
export const createGoods = async (event, items) => {
  // Convert payers in each item to an array of strings
  const mutatedItems = items.map((item) => ({
    ...item,
    payers: Object.keys(item.payers).map((key) => key.toString()),
  }));
  console.log("event: ", event);
  console.log("items: ", mutatedItems);
  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/add_items_to_event/?event=${encodeURIComponent(
        event
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mutatedItems),
      }
    );
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      alert("Session expired. Redirecting to login.");
      window.location.reload();
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error("Error adding items to event");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding items to event:", error.message);
    throw error;
  }
};
