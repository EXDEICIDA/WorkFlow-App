import { useEffect, useRef, useState } from "react";
import "./CanvasPage.css";
import CanvasItem from "../Components/CanvasItem";
import Curves from "../Components/Curves";

const CanvasPage = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [nextItemId, setNextItemId] = useState(1);
  const [editingTabId, setEditingTabId] = useState(null);
  const containerRef = useRef(null);

  // Get active tab's canvas items and connections
  const canvasItems = tabs[activeTabIndex]?.canvasItems || [];
  const connections = tabs[activeTabIndex]?.connections || [];

  const handleCanvasClick = (e) => {
    if (e.target === containerRef.current && activeTabIndex !== null) {
      const rect = e.target.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      const newItem = {
        id: nextItemId,
        position: { x, y },
      };

      setTabs(prevTabs => prevTabs.map((tab, index) => {
        if (index === activeTabIndex) {
          return {
            ...tab,
            canvasItems: [...(tab.canvasItems || []), newItem]
          };
        }
        return tab;
      }));
      setNextItemId(nextItemId + 1);
    }
  };

  const handleItemPositionChange = (itemId, newPosition) => {
    setTabs(prevTabs => prevTabs.map((tab, index) => {
      if (index === activeTabIndex) {
        return {
          ...tab,
          canvasItems: (tab.canvasItems || []).map(item =>
            item.id === itemId ? { ...item, position: newPosition } : item
          )
        };
      }
      return tab;
    }));
  };

  const handleConnect = (itemId, connectionPoint) => {
    if (!connectingFrom) {
      setConnectingFrom({ id: itemId, point: connectionPoint });
    } else {
      if (connectingFrom.id !== itemId) {
        setTabs(prevTabs => prevTabs.map((tab, index) => {
          if (index === activeTabIndex) {
            return {
              ...tab,
              connections: [...(tab.connections || []), {
                startId: connectingFrom.id,
                endId: itemId,
                startPoint: connectingFrom.point,
                endPoint: connectionPoint
              }]
            };
          }
          return tab;
        }));
      }
      setConnectingFrom(null);
    }
  };

  const handleDeleteConnection = (connectionIndex) => {
    setTabs(prevTabs => prevTabs.map((tab, index) => {
      if (index === activeTabIndex) {
        const newConnections = [...tab.connections];
        newConnections.splice(connectionIndex, 1);
        return {
          ...tab,
          connections: newConnections
        };
      }
      return tab;
    }));
  };

  const handlePan = (e) => {
    if (isDragging && isSpacePressed) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      setPan(prevPan => ({
        x: prevPan.x + deltaX,
        y: prevPan.y + deltaY
      }));
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e) => {
    if (isSpacePressed) {
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (zoomIn) => {
    setZoom(prevZoom => {
      const newZoom = zoomIn ? prevZoom * 1.1 : prevZoom / 1.1;
      return Math.min(Math.max(newZoom, 0.25), 2);
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleTabDoubleClick = (tabId) => {
    setEditingTabId(tabId);
  };

  const handleTabNameChange = (tabId, newName) => {
    setTabs(prevTabs => prevTabs.map(tab =>
      tab.id === tabId ? { ...tab, name: newName } : tab
    ));
  };

  const handleTabNameBlur = () => {
    setEditingTabId(null);
  };

  const handleTabNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditingTabId(null);
    }
  };

  const handleCloseTab = (tabId, event) => {
    event.stopPropagation();
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (newTabs.length === 0) {
      setActiveTabIndex(null);
    } else if (tabIndex <= activeTabIndex) {
      setActiveTabIndex(Math.max(0, activeTabIndex - 1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(true);
        document.body.style.cursor = "grab";
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsDragging(false);
        document.body.style.cursor = "default";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handlePan);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handlePan);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isSpacePressed]);

  return (
    <div className="canvas-page">
      <div className="canvas-header">
        <div className="tab-list">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`tab ${index === activeTabIndex ? 'active' : ''}`}
              onDoubleClick={() => handleTabDoubleClick(tab.id)}
            >
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  className="tab-name-input"
                  value={tab.name}
                  onChange={(e) => handleTabNameChange(tab.id, e.target.value)}
                  onBlur={handleTabNameBlur}
                  onKeyDown={handleTabNameKeyDown}
                  autoFocus
                />
              ) : (
                <>
                  <span onClick={() => setActiveTabIndex(index)}>{tab.name}</span>
                  <button 
                    className="close-tab-btn"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
          <button
            className="new-tab"
            onClick={() => {
              const newTab = {
                id: Date.now(),
                name: `Canvas ${tabs.length + 1}`,
                canvasItems: [],
                connections: []
              };
              setTabs([...tabs, newTab]);
              setActiveTabIndex(tabs.length);
            }}
          >
            +
          </button>
        </div>
      </div>

      {activeTabIndex !== null ? (
        <div 
          ref={containerRef}
          className="canvas-container"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            cursor: isSpacePressed ? (isDragging ? "grabbing" : "grab") : "default"
          }}
        >
          <Curves 
            connections={connections}
            items={canvasItems.reduce((acc, item) => {
              acc[item.id] = item;
              return acc;
            }, {})}
          />
          {canvasItems.map((item) => (
            <CanvasItem
              key={item.id}
              id={item.id}
              position={item.position}
              onPositionChange={handleItemPositionChange}
              onConnect={handleConnect}
              isConnecting={!!connectingFrom}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>No Canvas Selected</h2>
            <p>Click the + button to create a new canvas</p>
          </div>
        </div>
      )}

      <div className="tools-panel">
        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
        </button>
        <button
          className="tool-btn"
          onClick={() => handleZoom(true)}
          title="Zoom In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
        <button
          className="tool-btn"
          onClick={() => handleZoom(false)}
          title="Zoom Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 12h-15"
            />
          </svg>
        </button>
        <button
          className="tool-btn"
          onClick={handleResetZoom}
          title="Reset Zoom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.78-.93-.398-.164-.855-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
            />
          </svg>
        </button>
      </div>

      <div className="bottom-tools">
        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </button>
        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
            />
          </svg>
        </button>
        <button className="tool-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CanvasPage;
