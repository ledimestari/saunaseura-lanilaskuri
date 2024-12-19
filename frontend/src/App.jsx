import { useState } from "react";
import "./styles/App.css";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <>
      <div className="MainBlock">
        <div className="TopBar">
          <div className="TopBarTitleLeft">[ver. 1.0]</div>
          <div className="TopBarTitleCenter">lanilaskuri</div>
          <div className="TopBarTitleRight">[dev]</div>
        </div>
        <div className="BottomHalf">
          <MainPage></MainPage>
        </div>
      </div>
    </>
  );
}

export default App;
