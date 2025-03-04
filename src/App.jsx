import React, { useState } from 'react';
import ForceGraph from './components/ForceGraph';
import './style.css';

const App = () => {
  const [selectedNode, setSelectedNode] = useState(null);

  // Sample data
  const nodes = [
    { id: "1", name: "Node 1", text: "Hello Node 1" },
    { id: "2", name: "Node 2", text: "Hello Node 2" },
    { id: "3", name: "Node 3", text: "Hello Node 3" },
    { id: "4", name: "Node 4", text: "Hello Node 4" },
    { id: "5", name: "Node 5", text: "Hello Node 5" }
  ];
  
  const links = [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
    { source: "2", target: "4" },
    { source: "3", target: "5" },
    { source: "4", target: "5" }
  ];

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="app-container">
      <div className="graph-container">
        <ForceGraph 
          width={800} 
          height={600} 
          nodes={nodes} 
          links={links} 
          nodeRadius={7}
          onNodeSelect={handleNodeSelect}
        />
      </div>
      
      <div className="text-container">
        <h3 className="node-text">
          {selectedNode ? 
            (selectedNode.text || "No text available for this node.") : 
            "Select a node to view details"}
        </h3>
      </div>
    </div>
  );
};

export default App;