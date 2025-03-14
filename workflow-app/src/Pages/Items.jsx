// React is needed for JSX
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Folder, File, Plus, Search, ChevronDown, Trash2, Edit, ChevronLeft, Upload } from "lucide-react";
import "./Items.css";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api/items";

// Define item types for file type detection
const ItemTypes = [
  { name: "Document", icon: <File size={16} />, color: "#4285F4" },
  { name: "Spreadsheet", icon: <File size={16} />, color: "#0F9D58" },
  { name: "Image", icon: <File size={16} />, color: "#DB4437" },
  { name: "Video", icon: <File size={16} />, color: "#F4B400" },
  { name: "Audio", icon: <File size={16} />, color: "#AB47BC" },
  { name: "Archive", icon: <File size={16} />, color: "#795548" },
  { name: "Other", icon: <File size={16} />, color: "#607D8B" },
];

const Items = () => {
  const { authTokens } = useAuth();
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
    event.stopPropagation();
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
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(`Failed to delete item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId, event) => {
    event.stopPropagation();
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
    } catch (error) {
      console.error("Error deleting folder:", error);
      setError(`Failed to delete folder: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameItem = async (itemId, newName) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.put(`${API_BASE_URL}/${itemId}/rename`, { new_name: newName }, axiosConfig);
      
      // Refresh the items list
      fetchItems();
      
      // Update selected item if it was renamed
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem({...selectedItem, name: newName});
      }
    } catch (error) {
      console.error("Error renaming item:", error);
      setError(`Failed to rename item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // We'll keep this function even though it's not used yet
  // It will be useful for future feature implementation
  const handleMoveItem = async (itemId, newParentId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.put(`${API_BASE_URL}/${itemId}/move`, { new_parent_id: newParentId }, axiosConfig);
      
      // Refresh the items list
      fetchItems();
    } catch (error) {
      console.error("Error moving item:", error);
      setError(`Failed to move item: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
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

  const getItemTypeColor = (fileType) => {
    let itemTypeName = "Other";
    
    if (fileType) {
      const lowerFileType = fileType.toLowerCase();
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
      }
    }
    
    const itemType = ItemTypes.find(type => type.name === itemTypeName);
    return itemType ? itemType.color : "#607D8B";
  };

  const filteredItems = items.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = !selectedType || (item.file_type && item.file_type.toLowerCase() === selectedType.toLowerCase());
    return nameMatch && typeMatch;
  });

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="items-container">
      {selectedItem ? (
        <div className="item-detail-view">
          <button className="back-button" onClick={handleBackClick}>
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="item-details">
            <div className="item-icon" style={{ backgroundColor: getItemTypeColor(selectedItem.file_type) }}>
              <File size={32} color="#fff" />
            </div>
            <div className="item-info">
              <h2>{selectedItem.name}</h2>
              <p>Type: {selectedItem.file_type || "Unknown"}</p>
              <p>Size: {selectedItem.size ? `${Math.round(selectedItem.size / 1024)} KB` : "Unknown"}</p>
              <p>Created: {new Date(selectedItem.created_at).toLocaleString()}</p>
              {selectedItem.description && <p>Description: {selectedItem.description}</p>}
            </div>
          </div>
          <div className="item-actions">
            <button className="action-button">
              <Edit size={20} />
              Edit
            </button>
            <button className="action-button" onClick={(e) => handleDeleteItem(selectedItem.id, e)}>
              <Trash2 size={20} />
              Delete
            </button>
            <button className="action-button">
              <Upload size={20} />
              Download
            </button>
          </div>
          <div className="item-preview">
            {selectedItem.file_type && ['jpg', 'jpeg', 'png', 'gif'].includes(selectedItem.file_type.toLowerCase()) ? (
              <img src={selectedItem.file_url} alt={selectedItem.name} className="preview-image" />
            ) : (
              <div className="no-preview">
                <File size={64} />
                <p>No preview available</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="header-container">
            <div className="header-title">
              {currentFolder ? (
                <div className="breadcrumb">
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
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
                <Search size={20} className="search-icon" />
              </div>
              <div className="filter-container">
                <div className="filter-dropdown">
                  <button
                    className="filter-button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    {selectedType || "All Types"}
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
                          <div className="type-icon" style={{ backgroundColor: type.color }}>
                            {type.icon}
                          </div>
                          {type.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  className="date-sort"
                  value={dateSort}
                  onChange={handleDateSortChange}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="add-buttons">
                <button className="add-button" onClick={() => setShowFolderForm(true)}>
                  <Folder size={16} />
                  New Folder
                </button>
                <button className="add-button" onClick={() => setShowItemForm(true)}>
                  <Plus size={16} />
                  Upload
                </button>
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
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
                      >
                        <div className="folder-icon">
                          <Folder size={24} />
                        </div>
                        <div className="folder-info">
                          <h3>{folder.name}</h3>
                          <p>{new Date(folder.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          className="delete-button"
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                        >
                          <Trash2 size={16} />
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
                      >
                        <div
                          className="item-icon"
                          style={{ backgroundColor: getItemTypeColor(item.file_type) }}
                        >
                          <File size={24} color="#fff" />
                        </div>
                        <div className="item-info">
                          <h3>{item.name}</h3>
                          <p>{item.file_type || "Unknown"}</p>
                          <p>{item.size ? `${Math.round(item.size / 1024)} KB` : "Unknown"}</p>
                        </div>
                        <button
                          className="delete-button"
                          onClick={(e) => handleDeleteItem(item.id, e)}
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};

export default Items;