import React from "react";
import "./../styles/Components.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const GoodsRow = ({ item, price, payers }) => {
  return (
    <div className="Goods-Row">
      <div className="Goods-Cell">{item}</div>
      <div className="Goods-Cell">{price.toFixed(2)}€</div>
      <div className="Goods-Cell">{payers.join(", ")}</div>
      <div className="Goods-Buttons">
        <EditIcon
          className="hoverable-icon"
          onClick={() => {
            console.log("onClick");
          }}
        />
        <DeleteForeverIcon
          color="error"
          className="hoverable-icon"
          onClick={() => {
            console.log("onClick");
          }}
        />
      </div>
    </div>
  );
};

export default GoodsRow;
