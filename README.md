# PaddyMart - Paddy Field Marketplace System 🌾

PaddyMart is a full-stack web application designed to connect paddy field owners (farmers) with potential buyers. It provides a seamless platform for farmers to list their fields with detailed specifications and for buyers to discover, filter, and inquire about fields through real-time chat.

## 🚀 Features

* **User Roles:** Dedicated experiences for both **Farmers** (sellers) and **Buyers**.
* **Field Management:** Farmers can easily add, edit, and delete their paddy field listings.
* **Detailed Listings:** Fields can be described with specific agricultural details, including:
  * Size (Acres/Hectares/Perches)
  * Price & Location (Province, District, Address)
  * Soil Type (Clay, Sandy, Loamy, Silt, Peat)
  * Shape (Rectangular, Square, Irregular, etc.)
  * Water Source (River, Well, Canal, Rain Fed, Irrigation)
* **Advanced Search & Filtering:** Buyers can browse and filter fields by province, price range, shape, and soil type to find their exact requirements.
* **Real-time Messaging:** Integrated live chat allows buyers to communicate directly and instantly with farmers using Socket.IO.
* **Image Uploads:** Support for uploading multiple high-quality images for each field listing.

## 🛠️ Technology Stack

**Frontend:**
* React.js (v19)
* React Router for navigation
* React Icons & CSS for UI/UX
* Axios for API requests
* Socket.IO Client for real-time chat

**Backend:**
* Node.js & Express.js
* Socket.IO for WebSocket communication
* JSON Web Tokens (JWT) for secure authentication
* Multer for handling multipart/form-data (image uploads)
* In-memory Data Store (Easily swappable with MongoDB)

## ⚙️ How to Run Locally

Because the project is split into a frontend and a backend, you will need to start both servers in separate terminal windows.

### 1. Start the Backend Server
Open your terminal, navigate to the `backend` folder, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```
*(The backend runs on `http://localhost:5000`)*

### 2. Start the Frontend Application
Open a **new** terminal window, navigate to the `paddy-field-marketplace` folder, install dependencies, and start the React app:
```bash
cd paddy-field-marketplace
npm install
npm start
```
*(The frontend runs on `http://localhost:3000`)*

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](#) if you want to contribute.

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
