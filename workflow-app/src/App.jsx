import Sidebar from "./Components/Sidebar";
import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          {/* Your main content goes here */}
        </main>
      </div>
    </div>
  );
}

export default App;
