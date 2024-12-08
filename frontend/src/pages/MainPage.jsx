import React, { useState } from "react";
import LoadingSpinner from "../components/loading-spinner";
import "./../styles/MainPage.css";
import "./../styles/Components.css";

const mockupContent = [
  "LAN-pelitapahtuma",
  "Verkkopeliturnaus",
  "Moninpelitapahtuma",
  "Pelaajien kokoontuminen",
  "Pelimaraton",
  "Yhteisöllinen pelitapahtuma",
];

const MainPage = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [wrongPassword, setWrongPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === "test") {
      setIsAuthenticated(true);
    } else {
      setWrongPassword(true);
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <div className="MainPage-PasswordBlock">
          <div className="PasswordBlock">
            <form onSubmit={handleSubmit}>
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
            <button onClick={handleSubmit} className="ButtonStyle">
              Kirjaudu
            </button>
          </div>
        </div>
      ) : (
        <div className="MainPage-MainBlock">
          <div className="InnerBlock-Left">
            <p id="title">Luo uusi laskuri</p>
            <div id="content">
              {" "}
              <button className="ButtonStyle">Uusi laskuri</button>
            </div>
          </div>
          <div className="InnerBlock-Middle"></div>
          <div className="InnerBlock-Right">
            <p id="title">Valitse olemassa oleva laskuri</p>
            {loading ? (
              <div id={loading ? "content-loading" : "content"}>
                <p>Lataa laskureita...</p>
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div id="content">
                  {mockupContent.map((date, index) => (
                    <button key={index} className="ButtonStyle">
                      {date}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MainPage;
