import { useEffect, useRef, useState, useCallback } from "react";
import "./CanvasPage.css";
import CanvasItem from "../Components/CanvasItem";
import Curves from "../Components/Curves";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api";

const CanvasPage = () => {
  const { authTokens } = useAuth();
  const location = useLocation();
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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const loadingCanvasRef = useRef(false); // Track if we're currently loading a canvas
  const prevTabCountRef = useRef(0);

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
                endPoint: connectionPoint,
                direction: 'nondirectional', 
                color: '#6a6a6a' 
              }]
            };
          }
          return tab;
        }));
      }
      setConnectingFrom(null);
    }
  };

  const handleUpdateConnection = (connectionIndex, updates) => {
    setTabs(prevTabs => prevTabs.map((tab, index) => {
      if (index === activeTabIndex) {
        const newConnections = [...tab.connections];
        newConnections[connectionIndex] = {
          ...newConnections[connectionIndex],
          ...updates
        };
        return {
          ...tab,
          connections: newConnections
        };
      }
      return tab;
    }));
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

  const handleDeleteItem = (itemId) => {
    setTabs(prevTabs => prevTabs.map((tab, index) => {
      if (index === activeTabIndex) {
        // Remove the item
        const newCanvasItems = tab.canvasItems.filter(item => item.id !== itemId);
        // Remove any connections involving this item
        const newConnections = tab.connections.filter(
          conn => conn.startId !== itemId && conn.endId !== itemId
        );
        return {
          ...tab,
          canvasItems: newCanvasItems,
          connections: newConnections
        };
      }
      return tab;
    }));
  };

  const handlePan = useCallback((e) => {
    if (isDragging && isSpacePressed) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      setPan(prevPan => ({
        x: prevPan.x + deltaX,
        y: prevPan.y + deltaY
      }));
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isSpacePressed, startPos]);

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
    
    // Set loading flag to prevent canvas reload
    loadingCanvasRef.current = true;
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (newTabs.length === 0) {
      setActiveTabIndex(null);
      // Clear URL parameters when closing the last tab
      window.history.replaceState(null, '', '/canvas');
    } else if (tabIndex <= activeTabIndex) {
      setActiveTabIndex(Math.max(0, activeTabIndex - 1));
    }
    
    // Reset loading flag after a delay
    setTimeout(() => {
      loadingCanvasRef.current = false;
    }, 500);
  };

  const handleSaveCanvas = async () => {
    if (activeTabIndex === null || !tabs[activeTabIndex]) {
      toast.error("No canvas selected to save");
      return;
    }
    
    try {
      setIsSaving(true);
      const activeTab = tabs[activeTabIndex];
      
      // Prepare canvas data
      const canvasData = {
        name: activeTab.name,
        content: JSON.stringify({
          canvasItems: activeTab.canvasItems || [],
          connections: activeTab.connections || []
        }),
        description: `Canvas created on ${new Date().toLocaleDateString()}`
      };
      
      // Check if this tab has a canvas ID from a previous load
      const searchParams = new URLSearchParams(location.search);
      const canvasId = searchParams.get('id');
      
      let response;
      
      if (canvasId) {
        // Update existing canvas
        response = await axios.put(
          `${API_BASE_URL}/canvas/${canvasId}`, 
          canvasData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authTokens?.access_token || ''}`
            }
          }
        );
        toast.success(`Canvas "${activeTab.name}" updated successfully`);
      } else {
        // Create new canvas
        response = await axios.post(
          `${API_BASE_URL}/canvas`, 
          canvasData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authTokens?.access_token || ''}`
            }
          }
        );
        
        // Update URL with the new canvas ID
        const newCanvasId = response.data.id;
        window.history.replaceState(null, '', `?id=${newCanvasId}`);
        
        toast.success(`Canvas "${activeTab.name}" saved successfully`);
      }
      
      console.log("Canvas saved:", response.data);
    } catch (error) {
      console.error("Error saving canvas:", error);
      toast.error(`Failed to save canvas: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle closing tabs without triggering canvas reload
  useEffect(() => {
    // If tab count decreased, we're closing tabs - set a flag
    if (tabs.length < prevTabCountRef.current) {
      loadingCanvasRef.current = true; // Prevent loading during tab close
      
      // Reset the loading flag after a short delay
      setTimeout(() => {
        loadingCanvasRef.current = false;
      }, 300);
    }
    
    // Update the previous tab count
    prevTabCountRef.current = tabs.length;
  }, [tabs.length]);

  // Load canvas from URL parameter if present
  useEffect(() => {
    const loadCanvasFromUrl = async () => {
      // Prevent multiple simultaneous loading attempts
      if (loadingCanvasRef.current) return;
      
      const searchParams = new URLSearchParams(location.search);
      const canvasId = searchParams.get('id');
      
      if (!canvasId || !authTokens) return;
      
      // Check if we already have this canvas loaded in the tabs
      if (tabs.some(tab => tab.canvasId === parseInt(canvasId))) {
        return; // Skip loading if already loaded
      }
      
      try {
        loadingCanvasRef.current = true; // Set loading flag
        setIsLoading(true);
        
        // Make API request to load canvas
        const response = await axios.get(
          `${API_BASE_URL}/canvas/${canvasId}`,
          {
            headers: {
              'Authorization': `Bearer ${authTokens?.access_token || ''}`
            }
          }
        );
        
        const canvasData = response.data;
        const content = JSON.parse(canvasData.content);
        
        // Create new tab with loaded canvas data
        const newTab = {
          id: Date.now(),
          canvasId: parseInt(canvasId),
          name: canvasData.name,
          canvasItems: content.canvasItems || [],
          connections: content.connections || []
        };
        
        setTabs(currentTabs => [...currentTabs, newTab]);
        setActiveTabIndex(tabs.length);
        
        // Update nextItemId to be greater than any existing item id
        const maxId = Math.max(
          0,
          ...(content.canvasItems || []).map(item => item.id)
        );
        setNextItemId(maxId + 1);
        
        toast.success(`Canvas "${canvasData.name}" loaded successfully`);
      } catch (error) {
        console.error("Error loading canvas:", error);
        toast.error(`Failed to load canvas: ${error.response?.data?.error || error.message}`);
      } finally {
        setIsLoading(false);
        // Reset loading flag after a short delay to prevent immediate reloading
        setTimeout(() => {
          loadingCanvasRef.current = false;
        }, 500);
      }
    };
    
    loadCanvasFromUrl();
  }, [location.search, authTokens, tabs]);

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
  }, [isDragging, isSpacePressed, handlePan]);

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
  items={canvasItems}
  onDeleteConnection={handleDeleteConnection}
  onUpdateConnection={handleUpdateConnection}
/>
          {canvasItems.map((item) => (
            <CanvasItem
              key={item.id}
              id={item.id}
              position={item.position}
              onPositionChange={handleItemPositionChange}
              onConnect={handleConnect}
              onDelete={handleDeleteItem}
              isConnecting={!!connectingFrom}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading canvas...</p>
              </div>
            ) : (
              <>
                <h2>No Canvas Selected</h2>
                <p>Click the + button to create a new canvas</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="tools-panel">
        <button id="add-workflow-btn" className="tool-btn">
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
              d="M10.343 3.94c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        
        <button 
          className="tool-btn"
          onClick={handleSaveCanvas}
          disabled={isSaving || activeTabIndex === null}
          title="Save Canvas"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 11.186 0Z" />
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
              d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25V11.25a9 9 0 0 0-9-9Z"
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
              d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CanvasPage;
