import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const useAIInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState(null); // seconds remaining
  const [summary, setSummary] = useState(null); // fallback summary on quota error
  const timerRef = useRef(null);

  // Countdown timer when rate-limited
  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setError(""); // clear the error once the cooldown expires
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [retryAfter]);

  const fetchInsights = async () => {
    if (!user) {
      setError("No authenticated user found.");
      return;
    }

    // Don't allow fetch while in cooldown
    if (retryAfter !== null && retryAfter > 0) {
      setError(`AI quota exceeded. Please wait ${retryAfter}s before retrying.`);
      return;
    }

    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const token = await user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await axios.get(`${API_URL}/api/ai/insights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInsights(res.data.insights);
    } catch (err) {
      console.error("AI Insights fetch error:", err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 429) {
          // Rate-limit / quota exceeded
          const waitSecs = data.retryAfterSeconds || 60;
          setRetryAfter(waitSecs);
          setError(
            `AI quota exceeded. The free-tier daily limit has been reached. Please try again in ${waitSecs} seconds.`
          );
          if (data.summary) {
            setSummary(data.summary); // show financial summary as fallback
          }
        } else if (status === 400) {
          setError(data.error || "Not enough transaction data for analysis.");
        } else {
          setError("Failed to fetch AI insights. Please try again later.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading, error, retryAfter, summary, refetch: fetchInsights };
};

export default useAIInsights;
