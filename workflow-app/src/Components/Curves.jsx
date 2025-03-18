import { useState } from "react";
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

  const handleConnectionClick = (e, index) => {
    e.stopPropagation();
    
    // Get the SVG container's position
    const svgContainer = e.target.closest('svg');
    const svgRect = svgContainer.getBoundingClientRect();
    
    // Calculate position relative to the viewport
    const x = e.clientX;
    const y = e.clientY;
    
    setSelectedConnection(index);
    setPopupPosition({ 
      x: x - svgRect.left,  // Adjust for SVG position
      y: y - svgRect.top    // Adjust for SVG position
    });
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

  const handleColorChange = (color) => {
    if (selectedConnection !== null && onUpdateConnection) {
      onUpdateConnection(selectedConnection, { color });
    }
    setShowColorPicker(false);
    setSelectedConnection(null);
  };

  // Function to calculate the arrow points for drawing custom arrows
  const calculateArrowPoints = (start, end, controlPoint1, controlPoint2) => {
    // For a bezier curve, we need to approximate the tangent at the endpoints
    // We'll use the direction from the control point to the endpoint for better approximation
    
    // For end arrow (pointing to end point)
    const endDx = end.x - controlPoint2.x;
    const endDy = end.y - controlPoint2.y;
    const endAngle = Math.atan2(endDy, endDx);
    
    // For start arrow (pointing away from start point)
    const startDx = controlPoint1.x - start.x;
    const startDy = controlPoint1.y - start.y;
    const startAngle = Math.atan2(startDy, startDx);
    
    const arrowSize = 12; // Slightly larger arrows for better visibility
    
    // Calculate end arrow points
    const endArrow = {
      p1: {
        x: end.x - arrowSize * Math.cos(endAngle - Math.PI/8),
        y: end.y - arrowSize * Math.sin(endAngle - Math.PI/8)
      },
      p2: {
        x: end.x,
        y: end.y
      },
      p3: {
        x: end.x - arrowSize * Math.cos(endAngle + Math.PI/8),
        y: end.y - arrowSize * Math.sin(endAngle + Math.PI/8)
      }
    };
    
    // Calculate start arrow points
    const startArrow = {
      p1: {
        x: start.x + arrowSize * Math.cos(startAngle - Math.PI/8),
        y: start.y + arrowSize * Math.sin(startAngle - Math.PI/8)
      },
      p2: {
        x: start.x,
        y: start.y
      },
      p3: {
        x: start.x + arrowSize * Math.cos(startAngle + Math.PI/8),
        y: start.y + arrowSize * Math.sin(startAngle + Math.PI/8)
      }
    };
    
    return { startArrow, endArrow };
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
          
          // Calculate arrow points for custom arrows
          const { startArrow, endArrow } = calculateArrowPoints(start, end, cp1, cp2);
          
          return (
            <g key={index} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
              {/* Main curve path */}
              <path
                d={path}
                fill="none"
                stroke={connection.color || "#6a6a6a"}
                strokeWidth="3"
                onClick={(e) => handleConnectionClick(e, index)}
                style={{ pointerEvents: 'all' }}
              />
              
              {/* End arrow (for unidirectional and bidirectional) */}
              {(connection.direction === 'unidirectional' || connection.direction === 'bidirectional') && (
                <polygon
                  points={`${endArrow.p1.x},${endArrow.p1.y} ${endArrow.p2.x},${endArrow.p2.y} ${endArrow.p3.x},${endArrow.p3.y}`}
                  fill={connection.color || "#6a6a6a"}
                  onClick={(e) => handleConnectionClick(e, index)}
                  style={{ pointerEvents: 'all' }}
                />
              )}
              
              {/* Start arrow (for bidirectional only) */}
              {connection.direction === 'bidirectional' && (
                <polygon
                  points={`${startArrow.p1.x},${startArrow.p1.y} ${startArrow.p2.x},${startArrow.p2.y} ${startArrow.p3.x},${startArrow.p3.y}`}
                  fill={connection.color || "#6a6a6a"}
                  onClick={(e) => handleConnectionClick(e, index)}
                  style={{ pointerEvents: 'all' }}
                />
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
                <span>No Direction</span>
              </button>
              <button
                className={`menu-item ${connections[selectedConnection]?.direction === 'unidirectional' ? 'active' : ''}`}
                onClick={() => handleDirectionChange('unidirectional')}
              >
                <span className="menu-icon">⟶</span>
                <span>One Direction</span>
              </button>
              <button
                className={`menu-item ${connections[selectedConnection]?.direction === 'bidirectional' ? 'active' : ''}`}
                onClick={() => handleDirectionChange('bidirectional')}
              >
                <span className="menu-icon">⟷</span>
                <span>Both Directions</span>
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
                  onClick={() => handleColorChange(color)}
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