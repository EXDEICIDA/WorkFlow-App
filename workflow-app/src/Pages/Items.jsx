// React is needed for JSX
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { File, Plus, ChevronDown, ChevronLeft, Upload, Filter, FileText, Image, Video, Music, Archive, AlertCircle, Edit, Table, Trash2, Palette } from "lucide-react";
import "./Items.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/items";

// Define item types for file type detection
const ItemTypes = [
  { name: "Document", icon: <FileText size={24} />, color: "#4285F4" },
  { name: "Spreadsheet", icon: <Table size={24} />, color: "#0F9D58" },
  { name: "Image", icon: <Image size={24} />, color: "#DB4437" },
  { name: "Video", icon: <Video size={24} />, color: "#F4B400" },
  { name: "Audio", icon: <Music size={24} />, color: "#AB47BC" },
  { name: "Archive", icon: <Archive size={24} />, color: "#795548" },
  { name: "Canvas", icon: <Palette size={24} />, color: "#009688" },
  { name: "Other", icon: <File size={24} />, color: "#607D8B" },
];

const Items = () => {
  const { authTokens } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [dateSort, setDateSort] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    type: "Document",
    file: null
  });
  const [newFolder, setNewFolder] = useState({
    name: ""
  });
  const [showItemForm, setShowItemForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });

  // Wrap axiosConfig in useMemo to prevent dependency cycle
  const axiosConfig = useMemo(() => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authTokens?.access_token || ''}`
    }
  }), [authTokens]);

  // Wrap fetchItems in useCallback to prevent dependency cycle
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const parentId = currentFolder ? currentFolder.id : null;
      const response = await axios.get(API_BASE_URL, {
        ...axiosConfig,
        params: { parent_id: parentId }
      });
      
      const allItems = response.data || [];
      console.log("Fetched items:", allItems);
      
      const folderItems = allItems.filter(item => item.type === 'folder');
      const fileItems = allItems.filter(item => item.type === 'file');
      
      setFolders(folderItems);
      setItems(fileItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(`Failed to load items: ${error.response?.data?.error || error.message}`);
      setIsLoading(false);
    }
  }, [currentFolder, axiosConfig]);

  useEffect(() => {
    if (authTokens) {
      fetchItems();
    }
  }, [authTokens, fetchItems]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateSortChange = (e) => {
    const sortOrder = e.target.value;
    setDateSort(sortOrder);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      if (!newItem.file) {
        setError("Please select a file to upload");
        setIsLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('file', newItem.file);
      
      const fileName = newItem.file.name;
      const fileType = fileName.split('.').pop().toLowerCase();
      
      // In a real implementation, you would first upload to storage and get a URL back
      // For now, we'll use a placeholder URL
      const fileUrl = `https://storage.example.com/${Date.now()}-${fileName}`;
      
      const fileData = {
        name: newItem.name || fileName, // Use filename if name is empty
        file_type: fileType,
        file_url: fileUrl,
        parent_id: currentFolder ? currentFolder.id : null,
        size: newItem.file.size
      };
      
      console.log("Creating file with data:", fileData);
      
      // Make sure we're sending the data as JSON
      const response = await axios.post(
        `${API_BASE_URL}/file`, 
        fileData, 
        axiosConfig
      );
      
      console.log("File creation response:", response.data);
      
      // Refresh the items list
      fetchItems();
      
      // Reset form
      setNewItem({
        name: "",
        description: "",
        type: "Document",
        file: null
      });
      setShowItemForm(false);
    } catch (error) {
      console.error("Error adding item:", error);
      setError(`Failed to add item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      if (!newFolder.name.trim()) {
        setError("Folder name cannot be empty");
        setIsLoading(false);
        return;
      }
      
      const folderData = {
        name: newFolder.name,
        parent_id: currentFolder ? currentFolder.id : null
      };
      
      console.log("Creating folder with data:", folderData);
      
      // Use the axiosConfig with Content-Type header
      const response = await axios.post(
        `${API_BASE_URL}/folder`, 
        folderData, 
        axiosConfig
      );
      
      console.log("Folder creation response:", response.data);
      
      // Refresh the items list
      fetchItems();
      
      // Reset form
      setNewFolder({
        name: ""
      });
      setShowFolderForm(false);
    } catch (error) {
      console.error("Error adding folder:", error);
      setError(`Failed to add folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, event) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.delete(`${API_BASE_URL}/${itemId}`, axiosConfig);
      
      // Refresh the items list
      fetchItems();
      
      // If the deleted item was selected, clear selection
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(null);
      }
      
      // Clear delete confirmation state
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(`Failed to delete item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId, event) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.delete(`${API_BASE_URL}/${folderId}`, axiosConfig);
      
      // Refresh the items list
      fetchItems();
      
      // If the deleted folder was current, go back to parent
      if (currentFolder && currentFolder.id === folderId) {
        setCurrentFolder(null);
      }
      
      // Clear delete confirmation state
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
      setError(`Failed to delete folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const promptDeleteConfirmation = (item, event) => {
    if (event) {
      event.stopPropagation();
    }
    setItemToDelete(item);
    setShowDeleteConfirm(true);
    // Hide context menu if it was open
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Position the context menu at the mouse position
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };
  
  // Close context menu when clicking elsewhere
  const handleGlobalClick = useCallback(() => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  }, [contextMenu]);
  
  useEffect(() => {
    // Add event listener for clicks to close the context menu
    document.addEventListener('click', handleGlobalClick);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [handleGlobalClick]);

  const getItemIcon = (item) => {
    if (item.type === 'folder') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="#FFB74D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    // Check if it's a canvas file
    if (item.file_type === 'canvas') {
      return ItemTypes.find(t => t.name === "Canvas").icon;
    }
    
    // For other file types
    const extension = item.file_type ? item.file_type.toLowerCase() : '';
    
    if (['doc', 'docx', 'txt', 'pdf'].includes(extension)) {
      return ItemTypes.find(t => t.name === "Document").icon;
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return ItemTypes.find(t => t.name === "Spreadsheet").icon;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return ItemTypes.find(t => t.name === "Image").icon;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension)) {
      return ItemTypes.find(t => t.name === "Video").icon;
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return ItemTypes.find(t => t.name === "Audio").icon;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return ItemTypes.find(t => t.name === "Archive").icon;
    } else {
      return ItemTypes.find(t => t.name === "Other").icon;
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      setCurrentFolder(item);
    } else {
      // Handle file click based on file type
      if (item.file_type === 'canvas') {
        // Extract canvas ID from file_url
        const canvasId = item.file_url.split('/').pop();
        // Add timestamp to prevent duplicate loading
        const timestamp = Date.now();
        // Navigate to canvas page with the canvas ID and timestamp
        navigate(`/canvas?id=${canvasId}&t=${timestamp}`);
      } else {
        setSelectedItem(item);
      }
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  };

  const handleBackClick = () => {
    if (selectedItem) {
      setSelectedItem(null);
    } else if (currentFolder) {
      setCurrentFolder(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem({
        ...newItem,
        name: file.name,
        file: file
      });
    }
  };

  const handleNameChange = (e) => {
    setNewItem({
      ...newItem,
      name: e.target.value
    });
  };

  const handleDescriptionChange = (e) => {
    setNewItem({
      ...newItem,
      description: e.target.value
    });
  };

  const handleFolderNameChange = (e) => {
    setNewFolder({
      ...newFolder,
      name: e.target.value
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredItems = items
    .filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle "All Types" filter correctly
      if (!selectedType || selectedType === "") {
        return nameMatch;
      }
      
      // Get the item type category based on file extension
      let itemTypeName = "Other";
      if (item.file_type) {
        const lowerFileType = item.file_type.toLowerCase();
        if (['doc', 'docx', 'txt', 'pdf'].includes(lowerFileType)) {
          itemTypeName = "Document";
        } else if (['xls', 'xlsx', 'csv'].includes(lowerFileType)) {
          itemTypeName = "Spreadsheet";
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(lowerFileType)) {
          itemTypeName = "Image";
        } else if (['mp4', 'avi', 'mov', 'wmv'].includes(lowerFileType)) {
          itemTypeName = "Video";
        } else if (['mp3', 'wav', 'ogg'].includes(lowerFileType)) {
          itemTypeName = "Audio";
        } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerFileType)) {
          itemTypeName = "Archive";
        } else if (lowerFileType === 'canvas') {
          itemTypeName = "Canvas";
        }
      }
      
      // Match the selected type with the item's type category
      const typeMatch = itemTypeName === selectedType;
      
      return nameMatch && typeMatch;
    })
    .sort((a, b) => {
      // Apply date sorting based on dateSort state
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

  const filteredFolders = folders
    .filter(folder => folder.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Apply the same date sorting to folders
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="items-container">
      {selectedItem ? (
        <div className="item-detail-view">
          <button className="back-button" onClick={handleBackClick}>
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="item-details">
            <div className="item-icon">
              {getItemIcon(selectedItem)}
            </div>
            <div className="item-info">
              <h2>{selectedItem.name}</h2>
              <p>Type: {selectedItem.file_type || "Unknown"}</p>
              <p>Size: {selectedItem.size ? `${Math.round(selectedItem.size / 1024)} KB` : "Unknown"}</p>
              <p>Created: {formatDate(selectedItem.created_at)}</p>
              {selectedItem.description && <p>Description: {selectedItem.description}</p>}
            </div>
          </div>
          <div className="item-actions">
            <button className="action-button">
              <Edit size={20} />
              Edit
            </button>
            <button className="action-button delete-action" onClick={(e) => promptDeleteConfirmation(selectedItem, e)}>
              <Trash2 />
              Delete
            </button>
            <button className="action-button">
              <Upload size={20} />
              Download
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="header-container">
            <div className="header-title">
              {currentFolder ? (
                <div className="folder-navigation">
                  <button className="back-button" onClick={handleBackClick}>
                    <ChevronLeft size={20} />
                  </button>
                  <h1>{currentFolder.name}</h1>
                </div>
              ) : (
                <h1>My Files</h1>
              )}
            </div>
            <div className="header-actions">
              <div className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="type-filter-wrapper">
                <div className="dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <div className="dropdown-label">
                      <Filter size={16} />
                      {selectedType || "All Types"}
                    </div>
                    <ChevronDown size={16} />
                  </button>
                  {showTypeDropdown && (
                    <div className="dropdown-menu">
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedType("");
                          setShowTypeDropdown(false);
                        }}
                      >
                        All Types
                      </div>
                      {ItemTypes.map((type) => (
                        <div
                          key={type.name}
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedType(type.name);
                            setShowTypeDropdown(false);
                          }}
                        >
                          {type.icon}
                          {type.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="date-filter-wrapper">
                <select
                  className="date-filter"
                  value={dateSort}
                  onChange={handleDateSortChange}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="add-buttons">
                <button className="add-button folder-button" onClick={() => setShowFolderForm(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                  </svg>
                  New Folder
                </button>
                <button className="add-button" onClick={() => setShowItemForm(true)}>
                  <Plus size={16} />
                  Upload
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {filteredFolders.length > 0 && (
                <div className="folders-section">
                  <h2>Folders</h2>
                  <div className="folders-grid">
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="folder-card"
                        onClick={() => handleFolderClick(folder)}
                        onContextMenu={(e) => handleContextMenu(e, folder)}
                      >
                        <div className="folder-header">
                          <div className="folder-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="40" height="40">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                          </div>
                          <h3 className="folder-name">{folder.name}</h3>
                        </div>
                        <div className="folder-info">
                          <p className="folder-date">{formatDate(folder.created_at)}</p>
                        </div>
                        <button
                          className="item-delete-button"
                          onClick={(e) => promptDeleteConfirmation(folder, e)}
                          aria-label="Delete folder"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="items-section">
                <h2>Files</h2>
                {filteredItems.length > 0 ? (
                  <div className="items-grid">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="item-card"
                        onClick={() => handleItemClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                      >
                        <div className="item-icon">
                          {getItemIcon(item)}
                        </div>
                        <div className="item-info">
                          <h3 className="item-name">{item.name}</h3>
                          <p className="item-type">{item.file_type || "Unknown"}</p>
                          <p className="item-date">{formatDate(item.created_at)}</p>
                        </div>
                        <button
                          className="item-delete-button"
                          onClick={(e) => promptDeleteConfirmation(item, e)}
                          aria-label="Delete file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <File size={48} />
                    <p>No files found</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      
      {showItemForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Upload File</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Name (optional)</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={handleNameChange}
                  placeholder="File name (will use filename if empty)"
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newItem.description}
                  onChange={handleDescriptionChange}
                  placeholder="Add a description..."
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowItemForm(false)}>Cancel</button>
                <button type="submit">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showFolderForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Folder</h2>
            <form onSubmit={handleAddFolder}>
              <div className="form-group">
                <label>Folder Name</label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={handleFolderNameChange}
                  placeholder="Enter folder name"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowFolderForm(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete &quot;{itemToDelete?.name}&quot;?</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="form-actions">
              <button type="button" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button 
                type="button" 
                className="delete-confirm-button"
                onClick={() => itemToDelete?.type === 'folder' 
                  ? handleDeleteFolder(itemToDelete.id) 
                  : handleDeleteItem(itemToDelete.id)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed', 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="context-menu-item delete-menu-item"
            onClick={() => promptDeleteConfirmation(contextMenu.item)}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;