import React, { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, ChevronRight, Palette } from "lucide-react";
import "./Curves.css";

const Curves = ({ connections, items, onDeleteConnection, onUpdateConnection }) => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showDirectionMenu, setShowDirectionMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Colors array matching the image
  const colors = [
    '#6a6a6a', // gray
    '#ff6b6b', // red
    '#ffb86c', // orange
    '#f1fa8c', // yellow
    '#50fa7b', // green
    '#8be9fd', // cyan
    '#bd93f9', // purple
    
  ];

  const getConnectionPoint = (item, position) => {
    const width = 240;
    const height = 40;
    const borderWidth = 4;
    const totalWidth = width + (borderWidth * 2);
    const totalHeight = height + (borderWidth * 2);

    switch (position) {
      case "top":
        return {
          x: item.position.x + totalWidth / 2,
          y: item.position.y
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
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const baseOffset = Math.min(100, Math.max(50, distance * 0.25));
    
    let cp1 = { x: start.x, y: start.y };
    let cp2 = { x: end.x, y: end.y };

    const applyOffset = (point, position, offset) => {
      switch (position) {
        case "top": point.y -= offset; break;
        case "right": point.x += offset; break;
        case "bottom": point.y += offset; break;
        case "left": point.x -= offset; break;
      }
      return point;
    };

    cp1 = applyOffset(cp1, startPoint, baseOffset);
    cp2 = applyOffset(cp2, endPoint, baseOffset);

    return { cp1, cp2 };
  };

  const calculateArrowPoints = (path, isStart) => {
    const arrowSize = 10;
    const point = isStart ? path[0] : path[path.length - 1];
    const prevPoint = isStart ? path[1] : path[path.length - 2];
    
    const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);
    
    return [
      {
        x: point.x - arrowSize * Math.cos(angle - Math.PI / 6),
        y: point.y - arrowSize * Math.sin(angle - Math.PI / 6)
      },
      { x: point.x, y: point.y },
      {
        x: point.x - arrowSize * Math.cos(angle + Math.PI / 6),
        y: point.y - arrowSize * Math.sin(angle + Math.PI / 6)
      }
    ];
  };

  const handleConnectionClick = (e, index, path) => {
    e.stopPropagation();
    
    // Get the SVG container's position
    const svgContainer = e.target.closest('.connections-layer');
    const svgRect = svgContainer.getBoundingClientRect();
    
    // Calculate position relative to the SVG container
    const x = e.clientX;
    const y = e.clientY;
    
    setSelectedConnection(index);
    setPopupPosition({ x, y });
    setShowDirectionMenu(false);
    setShowColorPicker(false);
  };

  const handleDirectionChange = (direction) => {
    if (selectedConnection !== null && onUpdateConnection) {
      onUpdateConnection(selectedConnection, { direction });
    }
    setSelectedConnection(null);
  };

  const handleDelete = () => {
    if (selectedConnection !== null && onDeleteConnection) {
      onDeleteConnection(selectedConnection);
    }
    setSelectedConnection(null);
  };

  return (
    <>
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
          const startItem = items.find(item => item.id === connection.startId);
          const endItem = items.find(item => item.id === connection.endId);
          
          if (!startItem || !endItem) return null;
          
          const start = getConnectionPoint(startItem, connection.startPoint);
          const end = getConnectionPoint(endItem, connection.endPoint);
          const { cp1, cp2 } = calculateControlPoints(start, end, connection.startPoint, connection.endPoint);
          
          const path = `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
          
          return (
            <g key={index} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
              <path
                d={path}
                fill="none"
                stroke={connection.color || "#6a6a6a"}
                strokeWidth="2"
                onClick={(e) => handleConnectionClick(e, index, path)}
                style={{ pointerEvents: 'all' }}
              />
              {(connection.direction === 'unidirectional' || connection.direction === 'bidirectional') && (
                <marker
                  id={`arrowhead-end-${index}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={connection.color || "#6a6a6a"}
                  />
                </marker>
              )}
              {connection.direction === 'bidirectional' && (
                <marker
                  id={`arrowhead-start-${index}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="1"
                  refY="3.5"
                  orient="auto-start-reverse"
                >
                  <polygon
                    points="10 0, 0 3.5, 10 7"
                    fill={connection.color || "#6a6a6a"}
                  />
                </marker>
              )}
            </g>
          );
        })}
      </svg>
      
      {selectedConnection !== null && (
        <div className="connection-toolbar" style={{
          position: 'absolute',
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
        }}>
          <button className="toolbar-button" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
          <button className="toolbar-button" onClick={() => setShowColorPicker(!showColorPicker)}>
            <Palette size={16} />
          </button>
          <button 
            className="toolbar-button" 
            onClick={(e) => {
              e.stopPropagation();
              setShowDirectionMenu(!showDirectionMenu);
            }}
          >
            <ChevronRight size={16} />
          </button>

          {showDirectionMenu && (
            <div className="direction-menu">
              <button
                className={`menu-item ${connections[selectedConnection]?.direction === 'nondirectional' ? 'active' : ''}`}
                onClick={() => handleDirectionChange('nondirectional')}
              >
                <span className="menu-icon">━</span>
                <span>Nondirectional</span>
              </button>
              <button
                className={`menu-item ${connections[selectedConnection]?.direction === 'unidirectional' ? 'active' : ''}`}
                onClick={() => handleDirectionChange('unidirectional')}
              >
                <span className="menu-icon">⟶</span>
                <span>Unidirectional</span>
              </button>
              <button
                className={`menu-item ${connections[selectedConnection]?.direction === 'bidirectional' ? 'active' : ''}`}
                onClick={() => handleDirectionChange('bidirectional')}
              >
                <span className="menu-icon">⟷</span>
                <span>Bidirectional</span>
              </button>
            </div>
          )}

          {showColorPicker && (
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onUpdateConnection(selectedConnection, { color });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

Curves.propTypes = {
  connections: PropTypes.arrayOf(
    PropTypes.shape({
      startId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      endId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      startPoint: PropTypes.string.isRequired,
      endPoint: PropTypes.string.isRequired,
      direction: PropTypes.oneOf(['nondirectional', 'unidirectional', 'bidirectional']),
      color: PropTypes.string
    })
  ).isRequired,
  items: PropTypes.array.isRequired,
  onDeleteConnection: PropTypes.func,
  onUpdateConnection: PropTypes.func
};

export default Curves;