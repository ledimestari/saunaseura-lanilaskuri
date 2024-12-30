import { useState, useEffect } from "react";
import "./styles/App.css";
import MainPage from "./pages/MainPage";
import EventPage from "./pages/EventPage";
import { healthCheck } from "./helpers/queryServices";
import "./styles/Components.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

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

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
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
            <>
              <div onClick={handleBackToMain} className="hoverable-div">
                {" "}
                <ArrowBackIosIcon fontSize="10px" />
                <p>takaisin</p>
              </div>
            </>
          ) : (
            `ver. 1.0 | db: ${dbHealth}`
          )}
        </div>
        <div className="TopBarTitleCenter">
          <div id="item-title">
            {" "}
            {currentPage === "EventPage"
              ? selectedEvent.event_name
              : "lanilaskuri"}
          </div>
          <div id="item-description">
            {" "}
            {currentPage === "EventPage" ? selectedEvent.description : null}
          </div>
        </div>
        <div className="TopBarTitleRight">[dev]</div>
      </div>
      <div className="BottomHalf">
        {currentPage === "MainPage" ? (
          <MainPage onEventSelect={handleEventSelect} />
        ) : (
          <EventPage
            eventTitle={selectedEvent.event_name}
            onBack={handleBackToMain}
          />
        )}
      </div>
    </div>
  );
}

export default App;
