/_ Base styles _/

- {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  }

body {
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
line-height: 1.6;
color: #333;
background-color: #f5f5f5;
}

h1, h2, h3, h4 {
margin-bottom: 1rem;
color: #333;
}

ul {
list-style: none;
}

/_ App Layout _/
.app {
display: flex;
flex-direction: column;
min-height: 100vh;
}

.app-header {
background-color: #3f51b5;
color: white;
padding: 1rem 2rem;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-container {
display: flex;
flex: 1;
padding: 1rem;
}

.sidebar {
width: 300px;
background-color: white;
border-radius: 5px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
padding: 1rem;
margin-right: 1rem;
}

.main-content {
flex: 1;
background-color: white;
border-radius: 5px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
padding: 1rem;
display: flex;
flex-direction: column;
}

.content-container {
flex: 1;
padding: 1rem 0;
}

/_ Navigation _/
.navigation ul {
display: flex;
border-bottom: 1px solid #e0e0e0;
margin-bottom: 1rem;
}

.navigation li {
padding: 0.5rem 1rem;
cursor: pointer;
margin-right: 0.5rem;
border-bottom: 2px solid transparent;
}

.navigation li:hover {
color: #3f51b5;
}

.navigation li.active {
color: #3f51b5;
border-bottom: 2px solid #3f51b5;
font-weight: 500;
}

/_ Student Info _/
.student-info {
display: flex;
flex-direction: column;
}

.student-selector {
margin-bottom: 1.5rem;
}

.student-selector label {
display: block;
margin-bottom: 0.5rem;
font-weight: 500;
}

.student-selector select {
width: 100%;
padding: 0.5rem;
border: 1px solid #ddd;
border-radius: 4px;
font-size: 1rem;
}

.student-details {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.info-row {
display: flex;
justify-content: space-between;
}

.info-label {
font-weight: 500;
}

.degree-progress-summary {
margin-top: 1.5rem;
padding-top: 1rem;
border-top: 1px solid #eee;
}

.progress-bar-container {
width: 100%;
height: 10px;
background-color: #e0e0e0;
border-radius: 5px;
overflow: hidden;
margin: 0.5rem 0;
}

.progress-bar {
height: 100%;
background-color: #4caf50;
border-radius: 5px;
transition: width 0.3s ease;
}

.progress-details {
display: flex;
justify-content: space-between;
font-size: 0.9rem;
color: #666;
}

/_ Dashboard _/
.dashboard {
display: flex;
flex-direction: column;
}

.progress-summary {
background-color: #f9f9f9;
border-radius: 5px;
padding: 1rem;
margin-bottom: 1.5rem;
}

.progress-stats {
display: flex;
justify-content: space-between;
gap: 1rem;
margin-top: 0.5rem;
}

.stat-item {
background-color: white;
border-radius: 5px;
padding: 1rem;
text-align: center;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
flex: 1;
}

.stat-value {
display: block;
font-size: 1.5rem;
font-weight: 600;
margin-bottom: 0.25rem;
}

.stat-label {
font-size: 0.9rem;
color: #666;
}

.courses-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 1.5rem;
}

.course-group {
margin-bottom: 1.5rem;
}

.course-list {
display: flex;
flex-direction: column;
gap: 0.75rem;
max-height: 400px;
overflow-y: auto;
padding-right: 0.5rem;
}

.course-card {
background-color: #f9f9f9;
border-radius: 5px;
padding: 1rem;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.course-card h4 {
margin-bottom: 0.5rem;
font-size: 1rem;
}

.course-details {
display: flex;
flex-direction: column;
gap: 0.5rem;
font-size: 0.9rem;
}

.course-details span {
color: #666;
}

.prereqs {
margin-top: 0.5rem;
}

.prereqs ul {
padding-left: 1rem;
margin-top: 0.25rem;
}

.prereqs li {
margin-bottom: 0.25rem;
list-style-type: disc;
}

.prereqs li.completed {
color: #4caf50;
}

.empty-list {
padding: 1rem;
text-align: center;
color: #888;
font-style: italic;
}

/_ Course status-specific styling _/
.course-list.completed .course-card {
border-left: 4px solid #4caf50;
}

.course-list.in-progress .course-card {
border-left: 4px solid #2196f3;
}

.course-list.available .course-card {
border-left: 4px solid #ff9800;
}

.course-list.locked .course-card {
border-left: 4px solid #9e9e9e;
}

/_ Course Graph _/
.course-graph {
display: flex;
flex-direction: column;
}

.graph-legend {
display: flex;
justify-content: center;
gap: 1.5rem;
margin-bottom: 1rem;
}

.legend-item {
display: flex;
align-items: center;
gap: 0.5rem;
}

.legend-color {
width: 16px;
height: 16px;
border-radius: 4px;
}

.graph-container {
border: 1px solid #e0e0e0;
border-radius: 5px;
height: 600px;
margin-bottom: 1rem;
overflow: hidden;
}

.course-svg {
width: 100%;
height: 100%;
}

.graph-instructions {
text-align: center;
font-size: 0.9rem;
color: #666;
}

/_ Loading and Error states _/
.loading, .error, .no-student {
display: flex;
justify-content: center;
align-items: center;
height: 300px;
font-size: 1.2rem;
color: #666;
}

.error {
color: #f44336;
}
