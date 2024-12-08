import { useState } from "react";
import "./styles/App.css";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <>
      <div className="MainBlock">
        <div className="TopBar">
          <p>[dev]</p>
          <p>lanilaskuri</p>
          <p>[dev]</p>
        </div>
        <div className="BottomHalf">
          <MainPage></MainPage>
        </div>
      </div>
    </>
  );
}

export default App;
