import React, { useState, useRef, useEffect } from "react";
import { Trash2, Copy, RefreshCw, Edit } from "lucide-react";
import "./CanvasItem.css";
import PropTypes from "prop-types";

const CanvasItem = ({ id, position, onPositionChange, onUpdate, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState(`Item ${id}`);
  const [isEditing, setIsEditing] = useState(false);
  const itemRef = useRef(null);
  const inputRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.closest(".toolbar")) {
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
  };

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (onUpdate) {
      onUpdate(id, { content: e.target.value });
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      ref={itemRef}
      className="canvas-item"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="item-wrapper">
        <div className="toolbar">
          <button onClick={() => setIsEditing(true)}>
            <Edit size={16} />
          </button>
          <button>
            <Copy size={16} />
          </button>
          <button>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => onDelete?.(id)}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className="content-box">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={handleInputChange}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
              className="content-input"
            />
          ) : (
            <div className="content-text" onClick={() => setIsEditing(true)}>
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CanvasItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onPositionChange: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

export default CanvasItem;
