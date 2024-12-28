import { useState, useEffect } from "react";
import "./styles/App.css";
import MainPage from "./pages/MainPage";
import EventPage from "./pages/EventPage";
import { healthCheck } from "./helpers/queryServices";
import "./styles/Components.css";

function App() {
  const [dbHealth, setDbHealth] = useState(null);
  const [currentPage, setCurrentPage] = useState("MainPage");
  const [selectedEvent, setSelectedEvent] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      const response = await healthCheck();
      setDbHealth(response.status);
    };
    fetchHealth();
  }, []);

  const handleEventSelect = (eventTitle) => {
    setSelectedEvent(eventTitle);
    setCurrentPage("EventPage");
  };

  const handleBackToMain = () => {
    setCurrentPage("MainPage");
  };

  return (
    <div className="MainBlock">
      <div className="TopBar">
        <div className="TopBarTitleLeft">
          {currentPage === "EventPage" ? (
            <p onClick={handleBackToMain} className="hoverable-icon">
              takaisin
            </p>
          ) : (
            `ver. 1.0 | db: ${dbHealth}`
          )}
        </div>
        <div className="TopBarTitleCenter">
          {currentPage === "EventPage" ? selectedEvent : "lanilaskuri"}
        </div>
        <div className="TopBarTitleRight">[dev]</div>
      </div>
      <div className="BottomHalf">
        {currentPage === "MainPage" ? (
          <MainPage onEventSelect={handleEventSelect} />
        ) : (
          <EventPage eventTitle={selectedEvent} onBack={handleBackToMain} />
        )}
      </div>
    </div>
  );
}

export default App;
