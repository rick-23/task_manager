import React from "react";

const spinnerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80px",
};

const circleStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid #4f8cff",
    borderTop: "4px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
};

const keyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

const LoadingSpinner = () => (
    <div style={spinnerStyle}>
        <style>{keyframes}</style>
        <div style={circleStyle}></div>
    </div>
);

export default LoadingSpinner;