import React from "react";
import "./../styles/components.css";
import spinnerImage1 from "./../images/vade_nukkuu.png";
import spinnerImage2 from "./../images/andre.png";
import spinnerImage3 from "./../images/veni.png";
import spinnerImage4 from "./../images/miihail.png";

const LoadingSpinner = ({ size = 70 }) => {
  const spinnerImages = [
    spinnerImage1,
    spinnerImage2,
    spinnerImage3,
    spinnerImage4,
  ];
  const randomImage =
    spinnerImages[Math.floor(Math.random() * spinnerImages.length)];
  const sizeClass = `spinner-${size}`;
  return (
    <div>
      <img
        src={randomImage}
        alt="Loading..."
        className={`LoadingSpinner ${sizeClass}`}
      />
    </div>
  );
};

export default LoadingSpinner;
