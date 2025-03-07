import React, { useState, useEffect } from "react";
import axios from "axios";
import { Folder, File, Plus, Search, ChevronDown, Trash2, Edit, ChevronLeft } from "lucide-react";
import "./Items.css";

const API_BASE_URL = "http://localhost:8080/api/items";

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
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
    folderId: null
  });
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: ""
  });
  const [showItemForm, setShowItemForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchFolders();
  }, []);

  const fetchItems = async () => {
    try {
      // In a real app, this would fetch from your backend
      // For now, we'll use mock data
      const mockItems = [
        { id: 1, name: "Project Proposal", description: "Q4 Project Proposal", type: "Document", createdAt: "2023-11-15T10:30:00Z", folderId: 1 },
        { id: 2, name: "Budget Spreadsheet", description: "Annual budget", type: "Spreadsheet", createdAt: "2023-11-10T14:20:00Z", folderId: 1 },
        { id: 3, name: "Logo Design", description: "Company logo", type: "Image", createdAt: "2023-11-05T09:15:00Z", folderId: 2 },
        { id: 4, name: "Presentation", description: "Client presentation", type: "Document", createdAt: "2023-10-28T16:45:00Z", folderId: null },
        { id: 5, name: "Meeting Recording", description: "Team meeting", type: "Audio", createdAt: "2023-10-20T11:00:00Z", folderId: null },
      ];
      
      setItems(mockItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      // In a real app, this would fetch from your backend
      // For now, we'll use mock data
      const mockFolders = [
        { id: 1, name: "Work Documents", description: "Work-related documents", createdAt: "2023-11-01T08:00:00Z" },
        { id: 2, name: "Design Assets", description: "Graphics and design files", createdAt: "2023-10-15T13:30:00Z" },
        { id: 3, name: "Archives", description: "Archived projects", createdAt: "2023-09-20T15:45:00Z" },
      ];
      
      setFolders(mockFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateSortChange = (e) => {
    const sortOrder = e.target.value;
    setDateSort(sortOrder);

    const sortedItems = [...items].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setItems(sortedItems);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this would send to your backend
      const newItemWithId = {
        ...newItem,
        id: items.length + 1,
        createdAt: new Date().toISOString(),
      };
      
      setItems([...items, newItemWithId]);
      setNewItem({
        name: "",
        description: "",
        type: "Document",
        folderId: currentFolder ? currentFolder.id : null
      });
      setShowItemForm(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item");
    }
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this would send to your backend
      const newFolderWithId = {
        ...newFolder,
        id: folders.length + 1,
        createdAt: new Date().toISOString(),
      };
      
      setFolders([...folders, newFolderWithId]);
      setNewFolder({
        name: "",
        description: ""
      });
      setShowFolderForm(false);
    } catch (error) {
      console.error("Error adding folder:", error);
      alert("Failed to add folder");
    }
  };

  const handleDeleteItem = async (itemId, event) => {
    event.stopPropagation();
    try {
      // In a real app, this would call your backend
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const handleDeleteFolder = async (folderId, event) => {
    event.stopPropagation();
    try {
      // In a real app, this would call your backend
      setFolders(folders.filter((folder) => folder.id !== folderId));
      // Also remove items in this folder or move them to root
      setItems(items.map(item => 
        item.folderId === folderId ? { ...item, folderId: null } : item
      ));
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
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

  const filteredItems = items
    .filter((item) => 
      (currentFolder ? item.folderId === currentFolder.id : item.folderId === null) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType ? item.type === selectedType : true)
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

  const filteredFolders = folders
    .filter((folder) => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getItemTypeColor = (type) => {
    const itemType = ItemTypes.find(t => t.name === type);
    return itemType ? itemType.color : "#607D8B";
  };

  return (
    <div className="items-container">
      {selectedItem ? (
        // Item Detail View
        <div className="item-detail-view">
          <button className="back-button" onClick={handleBackClick}>
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="item-detail-header">
            <div className="item-type-indicator" style={{ backgroundColor: getItemTypeColor(selectedItem.type) }}>
              {ItemTypes.find(t => t.name === selectedItem.type)?.icon}
            </div>
            <h1>{selectedItem.name}</h1>
          </div>
          
          <div className="item-detail-info">
            <div className="info-row">
              <span className="info-label">Type:</span>
              <span className="info-value">{selectedItem.type}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Created:</span>
              <span className="info-value">{formatDate(selectedItem.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Description:</span>
              <span className="info-value">{selectedItem.description}</span>
            </div>
          </div>
          
          <div className="item-actions">
            <button className="edit-button">
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button className="delete-button" onClick={(e) => handleDeleteItem(selectedItem.id, e)}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        // Items List View
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
                <h1>Items</h1>
              )}
            </div>
            
            <div className="header-actions">
              <div className="search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              
              <div className="type-filter-wrapper">
                <div className="dropdown">
                  <button 
                    className="dropdown-toggle"
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
                          <div className="type-color" style={{ backgroundColor: type.color }}></div>
                          {type.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="date-filter-wrapper">
                <select
                  value={dateSort}
                  onChange={handleDateSortChange}
                  className="date-filter"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              
              <div className="add-buttons">
                <button 
                  className="add-button"
                  onClick={() => setShowItemForm(true)}
                >
                  <Plus size={16} />
                  <span>Add Item</span>
                </button>
                
                {!currentFolder && (
                  <button 
                    className="add-button folder-button"
                    onClick={() => setShowFolderForm(true)}
                  >
                    <Plus size={16} />
                    <span>Add Folder</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Folders Section (only shown at root level) */}
          {!currentFolder && filteredFolders.length > 0 && (
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
                      <h3 className="folder-name">{folder.name}</h3>
                      <p className="folder-date">{formatDate(folder.createdAt)}</p>
                    </div>
                    <button 
                      className="folder-delete"
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Items Section */}
          <div className="items-section">
            <h2>{currentFolder ? "Items" : "All Items"}</h2>
            {filteredItems.length > 0 ? (
              <div className="items-grid">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="item-card"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="item-type-icon" style={{ backgroundColor: getItemTypeColor(item.type) }}>
                      {ItemTypes.find(t => t.name === item.type)?.icon}
                    </div>
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-description">{item.description}</p>
                      <p className="item-date">{formatDate(item.createdAt)}</p>
                    </div>
                    <button 
                      className="item-delete"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No items found. Add a new item to get started.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Add Item Form Modal */}
      {showItemForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Item</h2>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                >
                  {ItemTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowItemForm(false)}>
                  Cancel
                </button>
                <button type="submit">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Folder Form Modal */}
      {showFolderForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Folder</h2>
            <form onSubmit={handleAddFolder}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newFolder.description}
                  onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowFolderForm(false)}>
                  Cancel
                </button>
                <button type="submit">Add Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;