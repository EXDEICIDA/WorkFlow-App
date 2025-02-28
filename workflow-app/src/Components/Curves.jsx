import React from "react";
import PropTypes from "prop-types";

const Curves = ({ connections, items }) => {
  const getConnectionPoint = (item, position) => {
    const width = 240; // Min-width from CSS content-box
    const height = 40; // Approximate height based on padding and content
    const dotSize = 8; // From CSS .connection-point
    const borderWidth = 4; // From CSS content-box border
    
    // Account for the border in calculations
    const totalWidth = width + (borderWidth * 2);
    const totalHeight = height + (borderWidth * 2);

    switch (position) {
      case "top":
        return {
          x: item.position.x + totalWidth / 2,
          y: item.position.y // The dot is already offset by CSS transform
        };
      case "right":
        return {
          x: item.position.x + totalWidth,
          y: item.position.y + totalHeight / 2
        };
      case "bottom":
        return {
          x: item.position.x + totalWidth / 2,
          y: item.position.y + totalHeight
        };
      case "left":
        return {
          x: item.position.x,
          y: item.position.y + totalHeight / 2
        };
      default:
        return item.position;
    }
  };

  const calculateControlPoints = (start, end, startPoint, endPoint) => {
    const deltaX = Math.abs(end.x - start.x);
    const deltaY = Math.abs(end.y - start.y);
    
    // Calculate dynamic offset based on distance between points
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const baseOffset = Math.min(100, Math.max(50, distance * 0.25));
    
    // Adjust offset based on connection points
    let cp1 = { x: start.x, y: start.y };
    let cp2 = { x: end.x, y: end.y };

    // Use exact offsets based on the connection point position
    const applyOffset = (point, position, offset) => {
      switch (position) {
        case "top":
          point.y -= offset;
          break;
        case "right":
          point.x += offset;
          break;
        case "bottom":
          point.y += offset;
          break;
        case "left":
          point.x -= offset;
          break;
      }
      return point;
    };

    cp1 = applyOffset(cp1, startPoint, baseOffset);
    cp2 = applyOffset(cp2, endPoint, baseOffset);

    return { cp1, cp2 };
  };

  const generatePath = (startItem, endItem, startPoint, endPoint) => {
    const start = getConnectionPoint(startItem, startPoint);
    const end = getConnectionPoint(endItem, endPoint);
    const { cp1, cp2 } = calculateControlPoints(start, end, startPoint, endPoint);
    
    return `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
  };

  return (
    <svg
      className="connections-layer"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {connections.map((connection, index) => {
        const startItem = items[connection.startId];
        const endItem = items[connection.endId];

        if (!startItem || !endItem) return null;

        return (
          <path
            key={index}
            d={generatePath(startItem, endItem, connection.startPoint, connection.endPoint)}
            fill="none"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={2}
            style={{
              filter: "drop-shadow(0 0 2px rgba(0, 0, 0, 0.3))",
            }}
          />
        );
      })}
    </svg>
  );
};

Curves.propTypes = {
  connections: PropTypes.arrayOf(
    PropTypes.shape({
      startId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      endId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      startPoint: PropTypes.oneOf(["left", "right", "top", "bottom"]).isRequired,
      endPoint: PropTypes.oneOf(["left", "right", "top", "bottom"]).isRequired,
    })
  ).isRequired,
  items: PropTypes.object.isRequired,
};

export default Curves;