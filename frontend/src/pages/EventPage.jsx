import React, { useEffect, useState } from "react";
import "./../styles/EventPage.css";
import "./../styles/Components.css";
import {
  getEventGoods,
  createGood,
  deleteItem,
  updateItemInEvent,
  uploadReceiptAndProcess,
  createGoods,
} from "../helpers/queryServices";
import GoodsRow from "../components/goodsItem";
import ReceiptRow from "../components/receiptItem";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import LoadingSpinner from "../components/loading-spinner";

const addItemModalStyle = {
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
};

const receiptModalStyle = {
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
};

const loadingModalStyle = {
  fontFamily: "'Courier New', monospace",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 220,
  height: 220,
  bgcolor: "#111111",
  boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
  borderRadius: 1,
  p: 4,
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const receiptEditingModalStyle = {
  fontFamily: "'Courier New', monospace",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 900,
  height: 600,
  bgcolor: "#111111",
  boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
  borderRadius: 1,
  p: 4,
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
};

const EventPage = ({ eventTitle, onBack }) => {
  const [goods, setGoods] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [goodsName, setGoodsName] = useState("");
  const [goodsPrice, setGoodsPrice] = useState("");
  const [payerForm, setPayerForm] = useState("");
  const [existingPayers, setExistingPayers] = useState([]);
  const [payerParts, setPayerParts] = useState({});
  const [totalAmount, setTotalAmount] = useState("");

  const [rowEditing, setRowEditing] = useState(false);
  const [rowItemId, setRowItemId] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptEditModalOpen, setReceiptEditModalOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [processedReceiptItems, setProcessedReceiptItems] = useState([]);
  const [receiptRowEditing, setReceiptRowEditing] = useState(false);

  // Call fetchEventGoods when the component mounts
  useEffect(() => {
    if (eventTitle) {
      fetchEventGoods();
    }
  }, [eventTitle]);

  // Handle payers for receipt items when a payer is added
  useEffect(() => {
    const mutatedPayers = [];
    Object.entries(existingPayers).forEach(([key, value]) => {
      if (value) {
        mutatedPayers.push(key);
      }
    });
    const mutatedItems = processedReceiptItems.map((item) => {
      return {
        ...item,
        payers: mutatedPayers,
      };
    });

    setProcessedReceiptItems(mutatedItems);
  }, [existingPayers]);

  // Call calculatePayersParts when goods or payers change
  useEffect(() => {
    if (goods.length > 0 && existingPayers) {
      calculatePayersParts();
    }
  }, [goods, existingPayers]); // Recalculate whenever goods or payers state changes

  // Fetch goods in an event and parse all payers in the items for easier use when adding more goods
  const fetchEventGoods = async () => {
    const response = await getEventGoods(eventTitle);
    setGoods(response);

    let allPayers = {};

    // Iterate over the items to collect unique payers
    // Payers are stored in an array of strings, but during the handling they are converted to objects
    // Once an item is created the payers are converted back to an array
    response.forEach((item) => {
      item.payers.forEach((payer) => {
        if (!allPayers[payer]) {
          allPayers[payer] = true;
        }
      });
    });
    setExistingPayers(allPayers);
  };

  // Open modal and initialize existingPayers with all payers set to true
  const handleAddModalOpen = () => {
    setAddModalOpen(true);
    const initialPayersState = {};
    Object.keys(existingPayers).forEach((item) => {
      let itemCopy = item;
      initialPayersState[itemCopy] = true;
    });
    if (!receiptEditModalOpen) {
      setExistingPayers(initialPayersState);
    }
  };

  // Close modal
  const handleAddModalClose = () => {
    setPayerForm("");
    setGoodsName("");
    setGoodsPrice("");
    setRowEditing(false);
    setAddModalOpen(false);
  };

  // Handle checkboxes for payers
  const handleCheckBoxChange = (e) => {
    const key = e.target.value;
    setExistingPayers((prevPayers) => {
      return {
        ...prevPayers,
        [key]: !prevPayers[key], // Toggle the payer's checkbox state
      };
    });
  };

  // Add payer to list
  const addPayer = (item) => {
    const updatedPayers = { ...existingPayers };
    if (!updatedPayers[item]) {
      updatedPayers[item] = true;
    }
    console.log("Adding payer to list: ", updatedPayers);
    setExistingPayers(updatedPayers);
  };

  // Create item and send to db
  // TODO: Add notifying of errors (maybe a general error text at top?)
  const handleItemCreation = async () => {
    const selectedPayers = Object.keys(existingPayers).filter(
      (payer) => existingPayers[payer] // Only select payers where the checkbox is true
    );

    if (goodsName && goodsPrice && selectedPayers.length > 0) {
      try {
        await createGood(eventTitle, goodsName, goodsPrice, selectedPayers);
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
    Object.keys(existingPayers).forEach((payer) => {
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
    const selectedPayers = Object.keys(existingPayers).filter(
      (payer) => existingPayers[payer] // Only select payers where the checkbox is true
    );

    try {
      await updateItemInEvent(
        eventTitle,
        rowItemId,
        goodsName,
        goodsPrice,
        selectedPayers
      );
      fetchEventGoods();
      handleAddModalClose();
    } catch (error) {
      console.log("Error updating item:", error);
    }
  };

  // Open modal and initialize existingPayers with all payers set to true
  const handleReceiptModalOpen = () => {
    setReceiptModalOpen(true);
  };

  // Close modal
  const handleReceiptModalClose = () => {
    setSelectedImage(null);
    setReceiptModalOpen(false);
  };

  // Handle receipt images
  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    setReceiptLoading(true);
    try {
      const response = await uploadReceiptAndProcess(selectedImage);
      const mutatedItems = response.map((item) => {
        return {
          ...item,
          payers: existingPayers,
        };
      });
      setProcessedReceiptItems(mutatedItems);
      handleReceiptModalClose();
      setReceiptEditModalOpen(true);
    } catch (error) {
      console.log("Error uploading image:", error);
    } finally {
      setReceiptLoading(false);
    }
  };

  // Close modal
  const handleReceiptEditModalClose = () => {
    setProcessedReceiptItems([]);
    setReceiptRowEditing(false);
    setReceiptEditModalOpen(false);
  };

  // Handle receipt item deletion
  const handleDeleteReceiptItem = async (id) => {
    try {
      const mutatedItems = processedReceiptItems.filter(
        (item) => item.id !== id
      );
      setProcessedReceiptItems(mutatedItems);
    } catch (error) {
      console.log("Error deleting an item:", error);
    }
  };

  // Handle receipt item editing
  const handleReceiptItemEditing = async () => {
    try {
      const payers = [];
      Object.keys(existingPayers).forEach((payer) => {
        if (existingPayers[payer]) {
          payers.push(payer);
        }
      });
      const mutatedItems = processedReceiptItems.map((item) => {
        if (item.id === rowItemId) {
          return {
            ...item,
            item: goodsName,
            price: goodsPrice,
            payers: payers,
          };
        }
        return item;
      });
      setProcessedReceiptItems(mutatedItems);
      handleAddModalClose();
    } catch (error) {
      console.log("Error editing an item:", error);
    }
  };

  // Handle adding multiple items
  // TODO: Add error handling and notification when the item is added
  const handleAddMultipleItems = async () => {
    setReceiptLoading(true);
    try {
      const response = await createGoods(eventTitle, processedReceiptItems);
      fetchEventGoods();
      if (response.status === "success") {
        handleReceiptEditModalClose();
      }
    } catch (error) {
      console.log("Error adding items:", error);
    } finally {
      setReceiptLoading(false);
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
          <div id="left-inner" onClick={handleReceiptModalOpen}>
            <AddIcon />
            <p>Kuitti</p>
          </div>
        </div>
        <Modal
          open={receiptModalOpen}
          onClose={handleReceiptModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {!receiptLoading ? (
            <Box sx={receiptModalStyle}>
              <p>
                <strong>
                  Kuitti voi olla .pdf, .png, .jpg, tai .jpeg muodossa.
                  PDF-muodossa oleva kuitti toimii parhaiten.
                </strong>
              </p>
              <p>Valitse kuitti:</p>
              <input
                style={{ paddingBottom: "20px" }}
                type="file"
                accept=".png, .jpg, .jpeg, .pdf"
                onChange={handleImageChange}
              />
              <button
                disabled={selectedImage === null}
                onClick={handleImageUpload}
                className={"ButtonStyle"}
              >
                Lisää
              </button>
              <button onClick={handleReceiptModalClose} className="ButtonStyle">
                Sulje
              </button>
            </Box>
          ) : (
            <Box sx={loadingModalStyle}>
              {" "}
              <LoadingSpinner size={150} />
              <p>Lataa...</p>
            </Box>
          )}
        </Modal>
        <Modal
          open={receiptEditModalOpen}
          onClose={handleReceiptEditModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {!receiptLoading ? (
            <Box sx={receiptEditingModalStyle}>
              <p>Muokkaa alla olevia tuotteita:</p>
              <div className="Mainblock-Table">
                {processedReceiptItems.map((item, index) => (
                  <ReceiptRow
                    key={index}
                    id={item.id}
                    item={item.item}
                    price={item.price}
                    payers={existingPayers}
                    onDeleteFunction={handleDeleteReceiptItem}
                    onEditFunction={() => {
                      setGoodsName(item.item);
                      setGoodsPrice(item.price);
                      setRowItemId(item.id);
                      setReceiptRowEditing(true);
                      setRowEditing(false);
                      handleAddModalOpen();
                    }}
                  />
                ))}
              </div>
              <div>Lisää maksaja:</div>
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
                {payerForm.length > 0 ? (
                  <div className="Input-HelperText">Paina enter</div>
                ) : null}
              </form>
              <div className="Modal-PayerBlock">
                {Object.keys(existingPayers).length > 0 && (
                  <>
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                      <FormControl component="fieldset" variant="standard">
                        <FormGroup row={true}>
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
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                {" "}
                <button
                  onClick={handleAddMultipleItems}
                  className={"ButtonStyle"}
                  disabled={Object.values(existingPayers).every(
                    (value) => !value
                  )}
                >
                  Lisää
                </button>
                <button
                  onClick={handleReceiptEditModalClose}
                  className="ButtonStyle"
                >
                  Sulje
                </button>
              </div>
            </Box>
          ) : (
            <Box sx={loadingModalStyle}>
              {" "}
              <LoadingSpinner size={150} />
              <p>Lataa...</p>
            </Box>
          )}
        </Modal>
        <Modal
          open={addModalOpen}
          onClose={handleAddModalClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={addItemModalStyle}>
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
            {!receiptEditModalOpen ? (
              <>
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
                  {payerForm.length > 0 ? (
                    <div className="Input-HelperText">Paina enter</div>
                  ) : null}
                </form>
                {Object.keys(existingPayers).length > 0 && (
                  <>
                    <p>Maksajat:</p>
                    <Box sx={{ display: "flex", paddingBottom: "10px" }}>
                      <FormControl component="fieldset" variant="standard">
                        <FormGroup row={true}>
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
              </>
            ) : (
              <div></div>
            )}
            <div style={{ paddingTop: "10px" }}>
              {" "}
              <button
                disabled={Object.keys(existingPayers).length === 0}
                onClick={
                  receiptRowEditing
                    ? handleReceiptItemEditing
                    : rowEditing
                    ? handleRowEditing
                    : handleItemCreation
                }
                className={"ButtonStyle"}
              >
                {receiptRowEditing || rowEditing ? "Muokkaa" : "Lisää"}
              </button>
              <button onClick={handleAddModalClose} className="ButtonStyle">
                Sulje
              </button>
            </div>
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
          {Object.entries(payerParts).map(([payer, amount, index]) => (
            <div id="center-inner" key={index}>
              <>
                <div>{payer}</div>
                <div>€{amount.toFixed(2)}</div>
              </>
            </div>
          ))}
        </div>
        <div id="right">yht: {totalAmount ? totalAmount.toFixed(2) : 0}€</div>
      </div>
    </div>
  );
};

export default EventPage;
