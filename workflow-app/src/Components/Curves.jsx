import React from "react";
import PropTypes from "prop-types";

const Curves = ({ connections, items }) => {
  const getConnectionPoint = (item, position) => {
    const width = 200; // Width of the item
    const height = 60;  // Height of the item

    switch (position) {
      case "top":
        return {
          x: item.position.x + width / 2,
          y: item.position.y
        };
      case "right":
        return {
          x: item.position.x + width,
          y: item.position.y + height / 2
        };
      case "bottom":
        return {
          x: item.position.x + width / 2,
          y: item.position.y + height
        };
      case "left":
        return {
          x: item.position.x,
          y: item.position.y + height / 2
        };
      default:
        return item.position;
    }
  };

  const calculateControlPoints = (start, end, startPoint, endPoint) => {
    const deltaX = Math.abs(end.x - start.x);
    const deltaY = Math.abs(end.y - start.y);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    // Adjust control points based on connection positions
    let cp1 = { x: start.x, y: start.y };
    let cp2 = { x: end.x, y: end.y };

    const offset = Math.min(100, Math.max(deltaX, deltaY) * 0.4);

    switch (startPoint) {
      case "top":
        cp1.y = start.y - offset;
        break;
      case "right":
        cp1.x = start.x + offset;
        break;
      case "bottom":
        cp1.y = start.y + offset;
        break;
      case "left":
        cp1.x = start.x - offset;
        break;
    }

    switch (endPoint) {
      case "top":
        cp2.y = end.y - offset;
        break;
      case "right":
        cp2.x = end.x + offset;
        break;
      case "bottom":
        cp2.y = end.y + offset;
        break;
      case "left":
        cp2.x = end.x - offset;
        break;
    }

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