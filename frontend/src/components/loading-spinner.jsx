import React from "react";
import "./../styles/components.css";
import spinnerImage from "./../images/vade_nukkuu.png";

const LoadingSpinner = () => {
  return (
    <div>
      <img src={spinnerImage} alt="Loading..." className="LoadingSpinner" />
    </div>
  );
};

export default LoadingSpinner;
