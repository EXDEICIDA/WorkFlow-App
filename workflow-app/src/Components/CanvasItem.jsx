// CanvasItem.jsx
import React, { useState, useRef, useEffect } from "react";
import "./CanvasItem.css";
import PropTypes from "prop-types";

const CanvasItem = ({ id, position, onConnect, onPositionChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const itemRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("connection-point")) {
      setIsConnecting(true);
      return;
    }

    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;

    onPositionChange(id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isConnecting) {
      setIsConnecting(false);
      // Handle connection completion here
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={itemRef}
      className="canvas-item"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="item-content">
        <h3>Item {id}</h3>
        <p>Drag to move</p>
      </div>
      <div className="connection-point top" />
      <div className="connection-point right" />
      <div className="connection-point bottom" />
      <div className="connection-point left" />
    </div>
  );
};

export default CanvasItem;
