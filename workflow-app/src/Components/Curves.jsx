import React from "react";
import PropTypes from "prop-types";

const Curves = ({ connections, items }) => {
  const calculateControlPoints = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const deltaX = Math.abs(end.x - start.x) * 0.4;

    return {
      cp1: { x: midX - deltaX, y: start.y },
      cp2: { x: midX + deltaX, y: end.y },
    };
  };

  const generatePath = (start, end) => {
    const { cp1, cp2 } = calculateControlPoints(start, end);
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

        const startPoint = {
          x: startItem.position.x + (connection.startPoint === "right" ? 200 : 0),
          y: startItem.position.y + 30,
        };

        const endPoint = {
          x: endItem.position.x + (connection.endPoint === "right" ? 200 : 0),
          y: endItem.position.y + 30,
        };

        return (
          <path
            key={index}
            d={generatePath(startPoint, endPoint)}
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
      startId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      endId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      startPoint: PropTypes.oneOf(["left", "right"]).isRequired,
      endPoint: PropTypes.oneOf(["left", "right"]).isRequired,
    })
  ).isRequired,
  items: PropTypes.object.isRequired,
};

export default Curves;