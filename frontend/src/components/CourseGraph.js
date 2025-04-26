import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function CourseGraph({ graphData }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up graph dimensions
    const width = 800;
    const height = 600;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Define colors for different course statuses
    const statusColors = {
      Completed: "#4CAF50", // Green
      "In Progress": "#2196F3", // Blue
      Available: "#FF9800", // Orange
      Locked: "#9E9E9E", // Gray
    };

    // Create a simulation with forces
    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink(graphData.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    // Create a container for all graph elements
    const container = svg.append("g");

    // Add zoom functionality
    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        })
    );

    // Add arrow marker for links
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // Draw links
    const link = container
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Draw nodes
    const node = container
      .append("g")
      .selectAll(".node")
      .data(graphData.nodes)
      .join("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Add circle for each node
    node
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d) => statusColors[d.status])
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Add course ID text
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text((d) => d.id.split(/(\d+)/)[1]); // Extract course number

    // Add course ID text
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text((d) => d.id.split(/(\d+)/)[0]); // Extract course prefix

    // Add tooltips
    node
      .append("title")
      .text(
        (d) => `${d.id}: ${d.name}\nCredits: ${d.credits}\nStatus: ${d.status}`
      );

    // Update positions on each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      // Clean up simulation when component unmounts
      simulation.stop();
    };
  }, [graphData]);

  if (!graphData) {
    return <div>No graph data available</div>;
  }

  return (
    <div className="course-graph">
      <h2>Prerequisite Graph</h2>
      <div className="graph-legend">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#4CAF50" }}
          ></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#2196F3" }}
          ></div>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#FF9800" }}
          ></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#9E9E9E" }}
          ></div>
          <span>Locked</span>
        </div>
      </div>
      <div className="graph-container">
        <svg ref={svgRef} className="course-svg"></svg>
      </div>
      <div className="graph-instructions">
        <p>
          Drag nodes to reposition. Scroll to zoom. Arrows indicate
          prerequisites.
        </p>
      </div>
    </div>
  );
}

export default CourseGraph;
