import { useState, useEffect } from "react";
import "./styles/App.css";
import MainPage from "./pages/MainPage";
import { healthCheck } from "./helpers/queryServices";

function App() {
  const [dbHealth, setDbHealth] = useState("");

  useEffect(
    () => async () => {
      const response = await healthCheck();
      setDbHealth(response.status);
    },
    []
  );

  return (
    <>
      <div className="MainBlock">
        <div className="TopBar">
          <div className="TopBarTitleLeft">[ver. 1.0] | db: {dbHealth}</div>
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
