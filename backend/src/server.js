import app from "./app.js";
import "./services/shipSimulator.js"; // Start ship movement simulation

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
