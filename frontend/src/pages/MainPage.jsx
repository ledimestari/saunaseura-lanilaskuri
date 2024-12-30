import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/loading-spinner";
import "./../styles/MainPage.css";
import "./../styles/Components.css";
import { authCheck, getEvents, createEvent } from "../helpers/queryServices";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

const modalStyle = {
  fontFamily: "'Courier New', monospace",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 200,
  bgcolor: "#111111",
  boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
  borderRadius: 1,
  p: 4,
  color: "white",
  gap: 20,
};

const MainPage = ({ onEventSelect }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth) {
      setIsAuthenticated(true);
      handleEventLoading();
    }
  }, []);

  // TODO: Implement logout button on page
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    setPassword("");
  };

  // Function to load events from the backend
  const handleEventLoading = async () => {
    setLoading(true);
    try {
      const response = await getEvents();
      setEvents(response);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to create an event
  const handleEventCreation = async () => {
    setLoading(true);
    try {
      const response = await createEvent(eventName, eventDesc);
      console.log(response);
      setEventName("");
      setEventDesc("");
    } catch (error) {
      console.error("Error setting events:", error);
    } finally {
      handleEventLoading();
      handleModalClose();
      setLoading(false);
    }
  };

  // Update characters to password variable when user is typing
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Update characters to eventName variable when user is typing
  const handleEventName = (e) => {
    setEventName(e.target.value);
  };

  // Update characters to eventDesc variable when user is typing
  const handleEventDesc = (e) => {
    setEventDesc(e.target.value);
  };

  // Handle password checking and download events when correct
  const handleAuthCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authCheck(password);
      if (response.status === "ok") {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        handleEventLoading();
      } else {
        setWrongPassword(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setWrongPassword(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <div className="MainPage-PasswordBlock">
          <div className="PasswordBlock">
            <form onSubmit={handleAuthCheck}>
              <input
                type="password"
                placeholder="Salasana"
                value={password}
                onChange={handlePasswordChange}
                style={{
                  color: "white",
                  backgroundColor: "transparent",
                  borderBottom: wrongPassword
                    ? "2px solid red"
                    : "2px solid white",
                  outline: "none",
                  marginBottom: "10px",
                  height: "30px",
                  margin: 0,
                }}
              />
            </form>
            <button onClick={handleAuthCheck} className="ButtonStyle">
              Kirjaudu
            </button>
          </div>
        </div>
      ) : (
        <div className="MainPage-MainBlock">
          <div className="InnerBlock-Left">
            <p id="title">Luo uusi laskuri:</p>
            <div id="content">
              <button onClick={handleModalOpen} className="ButtonStyle">
                Uusi laskuri
              </button>
            </div>
            <Modal
              open={modalOpen}
              onClose={handleModalClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={modalStyle}>
                <p>Laskurin nimi:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Nimi"
                    value={eventName}
                    onChange={handleEventName}
                  />
                </form>
                <p>Laskurin kuvaus:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Kuvaus"
                    value={eventDesc}
                    onChange={handleEventDesc}
                  />
                </form>
                <div style={{ paddingTop: "10px" }}>
                  <button
                    disabled={eventName.length <= 0}
                    onClick={handleEventCreation}
                    className="ButtonStyle"
                  >
                    Luo
                  </button>
                  <button onClick={handleModalClose} className="ButtonStyle">
                    Sulje
                  </button>
                </div>
              </Box>
            </Modal>
          </div>
          <div className="InnerBlock-Middle"></div>
          <div className="InnerBlock-Right">
            <p id="title">Valitse olemassa oleva laskuri:</p>
            {loading ? (
              <div id={loading ? "content-loading" : "content"}>
                <p>Lataa laskureita...</p>
                <LoadingSpinner />
              </div>
            ) : (
              <div id="content">
                {events.length === 0 ? (
                  <p>
                    Ei olemassa olevia laskureita. Luo uusi laskuri vasemmalta.
                  </p>
                ) : (
                  events.map((item, index) => (
                    <button
                      key={index}
                      className="ButtonStyle"
                      onClick={() => onEventSelect(item.event_name)}
                    >
                      {item.event_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MainPage;
