import React, { useEffect, useState } from "react";
import "./../styles/EventPage.css";
import "./../styles/Components.css";
import {
  getEventGoods,
  createGood,
  deleteItem,
  updateItemInEvent,
} from "../helpers/queryServices";
import GoodsRow from "../components/goodsItem";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const modalStyle = {
  fontFamily: "'Courier New', monospace",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 220,
  bgcolor: "#111111",
  boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
  borderRadius: 1,
  p: 4,
  color: "white",
  gap: 20,
};

const EventPage = ({ eventTitle, onBack }) => {
  const [goods, setGoods] = useState([]);
  const [payers, setPayers] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [goodsName, setGoodsName] = useState("");
  const [goodsPrice, setGoodsPrice] = useState("");
  const [payerForm, setPayerForm] = useState("");
  const [existingPayers, setExistingPayers] = useState([]);
  const [payerParts, setPayerParts] = useState({});
  const [totalAmount, setTotalAmount] = useState("");

  const [rowEditing, setRowEditing] = useState(false);
  const [rowItemId, setRowItemId] = useState("");

  // Call fetchEventGoods when the component mounts
  useEffect(() => {
    if (eventTitle) {
      fetchEventGoods();
    }
  }, [eventTitle]);

  // Call calculatePayersParts when goods or payers change
  useEffect(() => {
    if (goods.length > 0 && payers.length > 0) {
      calculatePayersParts();
    }
  }, [goods, payers]); // Recalculate whenever goods or payers state changes

  // Fetch goods in an event and parse all payers in the items for easier use when adding more goods
  const fetchEventGoods = async () => {
    const response = await getEventGoods(eventTitle);
    setGoods(response);
    let allPayers = [];
    response.forEach((item) => {
      item.payers.forEach((payer) => {
        if (!allPayers.includes(payer)) {
          allPayers.push(payer);
        }
      });
    });
    setPayers(allPayers);
  };

  // Open modal and initialize existingPayers with all payers set to true
  const handleAddModalOpen = () => {
    setAddModalOpen(true);
    const initialPayersState = payers.reduce((acc, payer) => {
      acc[payer] = true; // Set all payers to true by default
      return acc;
    }, {});
    setExistingPayers(initialPayersState); // Update existingPayers state
  };

  // Close modal
  // TODO: Empty all forms when closing modal
  const handleAddModalClose = () => {
    setGoodsName("");
    setGoodsPrice("");
    setRowEditing(false);
    setAddModalOpen(false);
  };

  // Handle checkbox change
  const handleCheckBoxChange = (e) => {
    const key = e.target.value;
    setExistingPayers((prevPayers) => {
      return {
        ...prevPayers,
        [key]: !prevPayers[key],
      };
    });
  };

  // Add payer to list
  const addPayer = (item) => {
    // Copy the current payers state into a new object
    const updatedPayers = { ...existingPayers };
    if (!updatedPayers[item]) {
      updatedPayers[item] = true;
    }
    setExistingPayers(updatedPayers);

    if (!payers.includes(item)) {
      setPayers((prevPayers) => [...prevPayers, item]);
    }
  };

  // Create item and send to db
  // TODO: Add notifying of errors (maybe a general error text at top?)
  const handleItemCreation = async () => {
    const payers = [];
    Object.keys(existingPayers).forEach((payer) => {
      if (existingPayers[payer]) {
        payers.push(payer);
      }
    });

    if (goodsName && goodsPrice && payers.length > 0) {
      try {
        await createGood(eventTitle, goodsName, goodsPrice, payers); // Use await in order to reflect the correct state of goods variable later
        fetchEventGoods();
      } catch (error) {
        console.log("Error creating item:", error);
      }
    } else {
      console.log("Please fill in all the fields.");
    }
  };

  // Calculate each payers part of the final price
  const calculatePayersParts = async () => {
    // Initialize all payers
    const finalPayers = {};
    payers.forEach((payer) => {
      finalPayers[payer] = 0;
    });

    // Log total amount to display
    let totalAmount = 0;

    // Go through all goods and divide the price by the number of payers for each item
    goods.forEach((item) => {
      totalAmount += item.price;
      const dividedValue = item.price / item.payers.length;
      item.payers.forEach((payer) => {
        if (finalPayers[payer] !== undefined) {
          finalPayers[payer] += dividedValue;
        }
      });
    });

    console.log(finalPayers);
    setPayerParts(finalPayers);
    setTotalAmount(totalAmount);
  };

  // Handle item deletion
  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(eventTitle, id);
      fetchEventGoods();
    } catch (error) {
      console.log("Error deleting an item:", error);
    }
  };

  // Handle item deletion
  const handleRowEditing = async () => {
    const payers = [];
    Object.keys(existingPayers).forEach((payer) => {
      if (existingPayers[payer]) {
        payers.push(payer);
      }
    });
    try {
      await updateItemInEvent(
        eventTitle,
        rowItemId,
        goodsName,
        goodsPrice,
        payers
      );
      fetchEventGoods();
    } catch (error) {
      console.log("Error updating item:", error);
    }
  };

  return (
    <div className="EventPage-Mainblock">
      <div className="Mainblock-Upper">
        <div id="left">
          <div id="left-inner" onClick={handleAddModalOpen}>
            <AddIcon />
            <p>Tuote</p>
          </div>
        </div>

        <Modal
          open={addModalOpen}
          onClose={handleAddModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <p>Tuote:</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                className="form-input"
                type="text"
                placeholder="Tuote"
                value={goodsName}
                onChange={(e) => setGoodsName(e.target.value)}
              />
            </form>
            <p>Hinta:</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="Hinta euroina"
                value={goodsPrice}
                onChange={(e) => setGoodsPrice(e.target.value)}
              />
            </form>
            <p>Lisää maksaja:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addPayer(payerForm);
                setPayerForm("");
              }}
            >
              <input
                className="form-input"
                type="text"
                step="0.01"
                placeholder="Nimi"
                value={payerForm}
                onChange={(e) => setPayerForm(e.target.value)}
              />
            </form>

            {Object.keys(existingPayers).length > 0 && (
              <>
                <p>Maksajat:</p>
                <Box sx={{ display: "flex", paddingBottom: "10px" }}>
                  <FormControl component="fieldset" variant="standard">
                    <FormGroup>
                      {Object.keys(existingPayers).map((payer) => (
                        <FormControlLabel
                          key={payer}
                          control={
                            <Checkbox
                              checked={existingPayers[payer] || false}
                              onChange={handleCheckBoxChange}
                              value={payer}
                            />
                          }
                          label={payer}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Box>
              </>
            )}

            <button
              disabled={Object.keys(existingPayers).length === 0}
              onClick={rowEditing ? handleRowEditing : handleItemCreation}
              className={"ButtonStyle"}
            >
              {rowEditing ? "Muokkaa" : "Lisää"}
            </button>
            <button onClick={handleAddModalClose} className="ButtonStyle">
              Sulje
            </button>
          </Box>
        </Modal>
      </div>

      <div className="Mainblock-Table">
        {goods && goods.length > 0 ? (
          goods.map((good, index) => (
            <GoodsRow
              key={index}
              id={good.id}
              item={good.item}
              price={good.price}
              payers={good.payers}
              onDeleteFunction={handleDeleteItem}
              onEditFunction={() => {
                setGoodsName(good.item);
                setGoodsPrice(good.price);
                setRowItemId(good.id);
                setRowEditing(true);
                handleAddModalOpen();
              }}
            />
          ))
        ) : (
          <p>Ei lisättyjä tuotteita</p>
        )}
      </div>

      <div className="Mainblock-Lower">
        <div id="left">Maksettavat:</div>
        <div id="center">
          {Object.entries(payerParts).map(([payer, amount]) => (
            <div id="center-inner">
              <>
                <div>{payer}</div>
                <div>€{amount.toFixed(2)}</div>
              </>
            </div>
          ))}
        </div>
        <div id="right">yht: {totalAmount}€</div>
      </div>
    </div>
  );
};

export default EventPage;
