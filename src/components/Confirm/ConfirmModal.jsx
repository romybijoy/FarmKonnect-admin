import React from 'react'

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) {
  if (!open) return null

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Top Icon Section */}
        <div style={iconWrapper}>
          <div
            style={{
              ...iconCircle,
              background: danger ? '#fee2e2' : '#e0f2fe',
              color: danger ? '#dc2626' : '#2563eb',
            }}
          >
            {danger ? '⚠' : 'ℹ'}
          </div>
        </div>

        <h2 style={titleStyle}>{title}</h2>

        <p style={messageStyle}>{message}</p>

        <div style={footerStyle}>
          <button style={cancelBtn} onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>

          <button
            style={{
              ...confirmBtn,
              background: danger ? '#dc2626' : '#111827',
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Styles ---------- */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalStyle = {
  background: 'white',
  padding: '32px 28px',
  borderRadius: 12,
  width: 440,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  textAlign: 'center',
  animation: 'fadeIn 0.2s ease',
}

const iconWrapper = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 18,
}

const iconCircle = {
  width: 50,
  height: 50,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  fontWeight: 600,
}

const titleStyle = {
  marginBottom: 10,
  fontWeight: 700,
  fontSize: 22,
  color: '#111827',
}

const messageStyle = {
  fontSize: 14,
  color: '#4b5563',
  marginBottom: 28,
  lineHeight: 1.6,
}

const footerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: 12,
}

const baseBtn = {
  padding: "10px 18px",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 150,
  height: 44, 
};

const cancelBtn = {
  ...baseBtn,
   background: "white",
  border: "1px solid #689F38",
  color: "#689F38",
};

const confirmBtn = (danger) => ({
  ...baseBtn,
  background: danger ? "#dc2626" : "#689F38",
  border: "none",
  color: "white",
})