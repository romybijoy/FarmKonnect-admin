// ReportDetailModal.jsx
import React from "react";

export default function ReportDetailModal({ report, onClose, onAction, processingId }) {
  if (!report) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.4)", zIndex: 2000
    }}>
      <div style={{ width: 820, maxWidth: "95%", background: "#fff", borderRadius: 8, padding: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Report #{report.id} — Post {report.postId}</h3>
          <button onClick={onClose}>Close</button>
        </header>

        <section style={{ marginTop: 12 }}>
          <div><strong>Reason:</strong> {report.reason}</div>
          <div style={{ marginTop: 8 }}><strong>Details:</strong></div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{report.details || "No details provided."}</div>

          <div style={{ marginTop: 12 }}>
            <strong>Reporter:</strong> {report.reporterId || "Unknown"} • <small>Reported at: {new Date(report.createdAt || Date.now()).toLocaleString()}</small>
          </div>

          <div style={{ marginTop: 12 }}>
            <a href={`/posts/${report.postId}`} target="_blank" rel="noreferrer">View Post</a>
          </div>
        </section>

        <footer style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={() => onAction(report.id, "DISMISS")} disabled={processingId === report.id}>Dismiss</button>
          <button onClick={() => onAction(report.id, "REMOVE_POST")} disabled={processingId === report.id} style={{ background: "#d9534f", color: "white" }}>
            {processingId === report.id ? "Processing..." : "Remove Post"}
          </button>
        </footer>
      </div>
    </div>
  );
}
