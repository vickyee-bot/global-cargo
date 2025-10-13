import { useEffect, useState } from "react";
import API from "@/lib/api";

function HealthCheck() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    API.get("/health")
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus("Failed to connect"));
  }, []);

  return <p>Backend Status: {status}</p>;
}

export default HealthCheck;
