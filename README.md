# 🎮 LAN Party Cost Management Tool

A project for managing costs during a LAN party. The frontend is built with React + Vite, and the backend is powered by FastAPI + MongoDB.  
This project is intended to be run on Linux.  
All texts in the application are in Finnish. (Just a FYI if you want to run this and the texts don't make any sense.)

### 📂 Project Structure:

Backend: Handles API logic and database interactions.  
Frontend: Provides the user interface for managing events and costs.

---

### 💡 Important:

- Use consistent API keys between the frontend and backend.
- Ensure MongoDB is running before starting the backend server.
- Refer to FastAPI documentation and Vite documentation for advanced configurations.

---

### 🛠️ Backend Setup

1. Navigate to the Backend Folder

   `cd backend`

2. Create a .env File  
   Generate an API key and add it to the .env file:

   `API_KEY=your_api_key`

3. Set Up a Virtual Environment

   `python -m venv fastapi-env`

4. Activate the Virtual Environment  
   Windows:  
   `fastapi-env\Scripts\activate`  
   Linux/Mac:  
   `source fastapi-env/bin/activat`

5. Install Dependencies

   `pip install -r requirements.txt`

6. Install MongoDB

   `sudo apt install -y mongodb`

7. Start and Enable MongoDB

   `sudo systemctl start mongodb`  
   `sudo systemctl enable mongodb`

8. Run the FastAPI Server

   `uvicorn main:app --host your_ip --port your_port --reload`

9. Backend is Ready! 🎉

---

### 🌐 Frontend Setup:

1. Navigate to the Frontend Folder

   `cd frontend`

2. Create a .env File  
   Add the generated API key:

   `VITE_API_KEY=your_api_key`

3. Install Dependencies

   `npm install`

4. Run the Development Server

   `npm run dev`

5. Frontend is Ready! 🎉

---

### 📝 TODO:

- Add deployment instructions for production setup.
