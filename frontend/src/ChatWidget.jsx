import { useState, useEffect, useRef } from "react";

const SESSION_ID = "demo-user";
const BACKEND_URL = "http://127.0.0.1:8000";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expectingFile, setExpectingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    startConversation();
  }, []);

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

  const handleSpecialUI = (reply) => {
    const text = reply.toLowerCase();
    if (text.includes("upload")) {
      setExpectingFile(true);
    } else {
      setExpectingFile(false);
    }
  };

  const sendMessage = async () => {
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
    setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    handleSpecialUI(data.reply);
    setInput("");
  };

  const handleFileUpload = async (file) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: "📎 " + file.name },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${BACKEND_URL}/upload-doc?session_id=${SESSION_ID}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (data.valid) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "✅ Document verified. Income: ₹" + data.income },
      ]);
      setExpectingFile(false);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Document rejected: " + data.reason },
      ]);
    }
  };

  const resetChat = async () => {
    await fetch(`${BACKEND_URL}/reset`, { method: "POST" });
    setMessages([]);
    setInput("");
    setExpectingFile(false);
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

              {/* ✅ DOWNLOAD BUTTON */}
              {m.text.toLowerCase().includes("sanction") && (
                <div style={{ marginTop: "8px" }}>
                  <a
                    href={`${BACKEND_URL}/download-sanction?session_id=${SESSION_ID}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      backgroundColor: "#1B5E20",
                      color: "white",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "13px",
                    }}
                  >
                    ⬇ Download Sanction Letter
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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

/* ---------------- STYLES ---------------- */

const styles = {
  chatCard: {
    margin: "50px auto",
    width: "360px",
    height: "520px",
    borderRadius: "15px",
    overflow: "hidden",
    border: "1px solid #E0E0E0",
    backgroundColor: "#F4F7F9",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    backgroundColor: "#1B5E20",
    color: "white",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    position: "relative",
  },
  resetBtn: {
    position: "absolute",
    right: "10px",
    top: "8px",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  },
  avatar: {
    backgroundColor: "white",
    color: "#1B5E20",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },
  title: { fontWeight: "bold" },
  status: { fontSize: "12px", color: "#C8E6C9" },
  chatArea: { flex: 1, padding: "10px", overflowY: "auto" },
  messageRow: { display: "flex", marginBottom: "8px" },
  bubble: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "75%",
    color: "#263238",
    fontSize: "14px",
  },
  inputArea: {
    display: "flex",
    padding: "8px",
    borderTop: "1px solid #E0E0E0",
    backgroundColor: "white",
    alignItems: "center",
  },
  uploadBtn: {
    marginRight: "6px",
    backgroundColor: "#E0E0E0",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    fontSize: "20px",
    cursor: "pointer",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "8px",
    borderRadius: "20px",
    backgroundColor: "#F4F7F9",
  },
  sendBtn: {
    marginLeft: "6px",
    backgroundColor: "#1B5E20",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    cursor: "pointer",
  },
};
