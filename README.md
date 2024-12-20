# Description

This is a project for handling costs for a lan party. Frontend is React + Vite. Backend is Fastapi + MongoDB.

# Backend

1. Move to backend folder
   - > cd backend
2. Create .env file and generate an API-key
   - > touch .env
   - In the file add API_KEY=_your_api_key_
3. Create a virtual environment:
   - > python -m venv fastapi-env
4. Activate the virtual environment:
   - (Windows) >fastapi-env\Scripts\activate
   - (Linux) >source fastapi-env/bin/activate
5. Requirements:
   - > pip install -r requirements.txt
   - > sudo apt install -y mongodb
6. Start and enable MongoDB:
   - > sudo systemctl start mongodb
   - > sudo systemctl enable mongodb
7. Start the FastApi server:
   - > uvicorn main:app --host _yourip_ --port _port_ --reload
8. Done.

# Frontend

1. Move to frontend folder
   - > cd frontend
2. Create .env file and add the generated API-key
   - > touch .env
   - In the file add REACT_APP_API_KEY=_your_api_key_
3. Install packages
   - > npm install
4. Start app
   - > npm run dev
