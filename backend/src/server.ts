
import http from "http";
import app from "./app.js";
import { config } from "dotenv";
config();

const PORT = process.env.PORT || 8000;

// Start HTTPS server
http.createServer(app).listen(PORT, () => {
  console.log(`HTTP Server listening on http://localhost:${PORT}`);
});