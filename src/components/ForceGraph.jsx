import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

const ForceGraph = ({ 
  width = 600, 
  height = 400, 
  nodeRadius = 5,
  nodes = [], 
  links = [],
  onNodeSelect = () => {}
}) => {
  const svgRef = useRef(null);
  const isInitializedRef = useRef(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // One-time initialization effect
  useLayoutEffect(() => {
    // Check if SVG element exists and is empty
    const svgElement = svgRef.current;
    if (!svgElement || !nodes.length) return;

    // Check if we've already initialized this graph
    if (isInitializedRef.current) {
      console.log("Graph already initialized, skipping");
      return;
    }

    // Clear any existing content before initializing
    d3.select(svgElement).selectAll("*").remove();
    
    console.log("INITIAL SETUP - should happen only once");
    isInitializedRef.current = true;
    
    // Setup the SVG container
    const svg = d3.select(svgElement)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%; height: 100%; max-width: none; max-height: none;");
    
    // Create the main container group
    const g = svg.append("g");
    
    // Setup zoom behavior
    const zoom = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.25, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
    // Create the simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(nodeRadius * 1.5));
    
    // Create the link group and elements
    const linkGroup = g.append("g")
      .attr("class", "links")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);
    
    const linkElements = linkGroup.selectAll("line")
      .data(links)
      .join("line");
    
    // Create the node group and elements
    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);
    
    const nodeElements = nodeGroup.selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => d.color || "#1f77b4")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        onNodeSelect(d);
        
        // Center the clicked node by applying a zoom transform
        const svgElement = svgRef.current;
        const svgBounds = svgElement.getBoundingClientRect();
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calculate the transform needed to center the node
        const scale = d3.zoomTransform(svgElement).k;  // Maintain the current zoom level
        const translateX = centerX - d.x * scale;
        const translateY = centerY - d.y * scale;
        
        // Animate to the new centered position
        d3.select(svgElement)
          .transition()
          .duration(750)  // Animation duration in milliseconds
          .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
      });
    
    // Add tooltip titles
    nodeElements.append("title")
      .text(d => d.name || d.id);
    
    // Add drag behavior
    nodeElements.call(d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));
    
    // Add background click for deselection
    svg.on("click", () => {
      setSelectedNodeId(null);
      onNodeSelect(null);
    });
    
    // Update on simulation tick
    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      nodeElements
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });
    
    // Store important references in DOM elements themselves
    // to survive React re-renders completely
    svg.node().__simulation = simulation;
    svg.node().__nodeElements = nodeElements;
    
    // Cleanup function
    return () => {
      if (svgElement.__simulation) {
        svgElement.__simulation.stop();
      }
      // Don't reset initialization flag on normal re-renders
      // Only when the component is truly unmounted
      // isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - run only once
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, resetting initialization flag");
      isInitializedRef.current = false;
    };
  }, []);
  
  // Selection update effect
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const svg = d3.select(svgRef.current);
    if (!svg.node().__nodeElements) return;
    
    console.log("Updating selection only, not recreating simulation");
    
    // Access the node elements directly from the DOM reference
    svg.node().__nodeElements
      .attr("fill", d => selectedNodeId === d.id ? "#ff7700" : (d.color || "#1f77b4"));
      
  }, [selectedNodeId]);

  return <svg ref={svgRef} />;
};

export default ForceGraph;