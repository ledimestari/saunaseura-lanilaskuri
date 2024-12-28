import React from "react";
import "./../styles/Components.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const GoodsRow = ({
  item,
  price,
  payers,
  id,
  onDeleteFunction,
  onEditFunction,
}) => {
  return (
    <div className="Goods-Row">
      <div className="Goods-Cell">{item}</div>
      <div className="Goods-Cell">{price.toFixed(2)}€</div>
      <div className="Goods-Cell">{payers.join(", ")}</div>
      <div className="Goods-Buttons">
        <EditIcon
          className="hoverable-icon"
          onClick={() => {
            onEditFunction(item, price, payers, id);
          }}
        />
        <DeleteForeverIcon
          color="error"
          className="hoverable-icon"
          onClick={() => {
            onDeleteFunction(id);
          }}
        />
      </div>
    </div>
  );
};

export default GoodsRow;
