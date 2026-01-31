import { useState, useEffect, useRef } from "react";

const SESSION_ID = "demo-user";
const BACKEND_URL = "http://127.0.0.1:8000";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expectingFile, setExpectingFile] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    startConversation();
  }, []);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { role: "bot", text }]);
    handleSpecialUI(text);
  };

  const handleSpecialUI = (reply) => {
    const t = reply.toLowerCase();
    setExpectingFile(t.includes("upload"));
    setShowCamera(t.includes("camera") || t.includes("kyc"));
    if (t.includes("otp")) {
      setExpectingFile(false);
    }


  };

  const sendAadhaar = async (aadhaar) => {
    await fetch(`${BACKEND_URL}/aadhaar-generate-otp?session_id=${SESSION_ID}&aadhaar=${aadhaar}`, {
      method: "POST"
    });
  };

  const sendOtp = async (otp) => {
    await fetch(`${BACKEND_URL}/aadhaar-verify-otp?session_id=${SESSION_ID}&otp=${otp}`, {
      method: "POST"
    });
  };



  const startConversation = async () => {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: SESSION_ID,
        message: "hi",
      }),
    });

    const data = await res.json();
    setMessages([{ role: "bot", text: data.reply }]);
    handleSpecialUI(data.reply);
  };

  const sendMessage = async () => {
    if (messages[messages.length - 1]?.text.includes("Aadhaar")) {
      sendAadhaar(input);
    } else if (messages[messages.length - 1]?.text.includes("OTP")) {
      sendOtp(input);
    }

    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);

    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: SESSION_ID,
        message: input,
      }),
    });

    const data = await res.json();
    addBotMessage(data.reply);
    setInput("");
  };

  const handleFileUpload = async (file) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: "📎 " + file.name },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BACKEND_URL}/upload-doc?session_id=${SESSION_ID}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.valid) {
      addBotMessage("✅ Document verified. Income: ₹" + data.income);
    } else {
      addBotMessage("❌ Document rejected: " + data.reason);
    }
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    const formData = new FormData();
    formData.append("file", blob);

    await fetch(`${BACKEND_URL}/kyc-photo?session_id=${SESSION_ID}`, {
      method: "POST",
      body: formData,
    });

    addBotMessage("✅ KYC completed successfully.");
    setShowCamera(false);
  };

  const resetChat = async () => {
    await fetch(`${BACKEND_URL}/reset`, { method: "POST" });
    setMessages([]);
    setInput("");
    setExpectingFile(false);
    setShowCamera(false);
    startConversation();
  };

  return (
    <div style={styles.chatCard}>
      <div style={styles.header}>
        <div style={styles.avatar}>SX</div>
        <div>
          <div style={styles.title}>SanctionX</div>
          <div style={styles.status}>● Online</div>
        </div>

        <button onClick={resetChat} style={styles.resetBtn}>↻</button>
      </div>

      <div style={styles.chatArea}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.messageRow,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                backgroundColor: m.role === "user" ? "#DCF8C6" : "#E8F5E9",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {showCamera && (
        <div style={styles.cameraBox}>
          <div>Please wave hi for KYC verification</div>
          <video ref={videoRef} autoPlay width="200" />
          <div>
            <button onClick={startCamera}>Start Camera</button>
            <button onClick={capturePhoto}>Capture</button>
          </div>
        </div>
      )}

      <div style={styles.inputArea}>
        {expectingFile && (
          <>
            <button
              style={styles.uploadBtn}
              onClick={() => fileInputRef.current.click()}
            >
              +
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*,application/pdf"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </>
        )}

        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reply..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage} style={styles.sendBtn}>➤</button>
      </div>
    </div>
  );
}

const styles = {
  chatCard: {
    width: "360px",
    height: "560px",
    borderRadius: "22px",
    overflow: "hidden",
    backgroundColor: "#F2F2F2",
    display: "flex",
    margin: "50px auto",
    flexDirection: "column",
    fontFamily: "Segoe UI, sans-serif",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },

  header: {
    backgroundColor: "#2FA36B",
    color: "white",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    position: "relative",
  },

  resetBtn: {
    position: "absolute",
    right: "12px",
    top: "12px",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  },

  avatar: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },

  title: {
    fontWeight: "600",
    fontSize: "16px",
  },

  status: {
    fontSize: "12px",
    color: "#DFF5EA",
  },

  chatArea: {
    flex: 1,
    padding: "14px",
    overflowY: "auto",
    backgroundColor: "#F2F2F2",
  },

  messageRow: {
    display: "flex",
    marginBottom: "10px",
  },

  bubble: {
    padding: "12px 14px",
    borderRadius: "16px",
    maxWidth: "75%",
    fontSize: "14px",
    lineHeight: "1.4",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
  },

  cameraBox: {
    padding: "10px",
    backgroundColor: "#E6F4EC",
    textAlign: "center",
  },

  inputArea: {
    display: "flex",
    padding: "10px",
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    gap: "6px",
  },

  uploadBtn: {
    backgroundColor: "#E0E0E0",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    fontSize: "20px",
    cursor: "pointer",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 14px",
    borderRadius: "20px",
    backgroundColor: "white",
    fontSize: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  sendBtn: {
    backgroundColor: "#2FA36B",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
