DesirePath 🚶‍♂️⚡

Google Maps routes cars; DesirePath maps the secret alleys, courtyard gates, and campus cut-throughs that cut walk times in half.

DesirePath is an interactive pedestrian wayfinding web application built for the Peninsula Innovation Hackathon. It contrasts rigid, car-centric rectangular detours against hyper-local pedestrian shortcuts—complete with real-time crowd verification, dynamic obstacle rerouting, and a custom shortcut mapping engine.

✨ Key Features

Interactive SVG Cartography: Custom-built Bay Area Peninsula district map (Palo Alto Caltrain Station to University Ave & Engineering Quad) featuring layered architectural building footprints, park zones, and Caltrain tracks.

Before vs. After Comparison: Seamlessly toggle between Standard Maps (rigid block detours), DesirePath Mode (direct emerald cut-throughs), and Split Compare mode to visualize exact minutes, distance, and steps saved.

Live Obstacle Rerouting: Click any shortcut node (gates, alleys, stairwells, footbridges) to view crowd verifications (@maya_c, @alex_dev). Reporting a node as Blocked instantly turns it crimson and dynamically reroutes the active path around the obstacle.

Map a Shortcut Mode: Interactive drawing tool that lets users click waypoints directly on the map canvas to trace, name, tag (Gate, Alley, Stairs, Trail), and save new community cut-throughs live.

Live Crowd Simulator: Toggleable live demo feed that triggers real-time glassmorphic toast notifications and map pin pulse ripples as community members check in.

🛠️ Built With

Frontend: React, Vite, Tailwind CSS, HTML5, CSS3, SVG

Icons: Lucide React

Architecture: 100% Client-Side, Zero External API Keys Required

🚀 Quick Start & Installation

Ensure you have Node.js installed, then run the following commands in your terminal:

# Clone or navigate into the project directory
cd desirepath

# Install dependencies
npm install

# Start the local development server
npm run dev


Open http://localhost:5173 (or the local URL provided in your terminal) in your browser to view the application.

📦 Project Structure

desirepath/
├── index.html            # HTML entry point with page title & metadata
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.js        # Vite bundler configuration
├── package.json          # Project dependencies & scripts
└── src/
    ├── main.jsx          # React DOM root render
    ├── index.css         # Global styles & keyframe animations (`animate-dash-flow`)
    ├── App.jsx           # Main application engine (Map canvas, HUD, modal states, pan/zoom)
    └── data/
        └── mapData.js    # Peninsula coordinates, building footprints, nodes, and preset routes


💡 How to Use

Compare Routes: Use the top-center pill toggle to switch between Standard Maps and DesirePath Mode.

Test Obstacle Rerouting: Click any green pulsing node pin on the map to open its detail card, then click Report Blocked to watch the path instantly recalculate.

Add Your Own Cut-Through: Click Map a Shortcut in the top bar, click 2+ points on the map, name your shortcut, and save it.

Simulate Live Activity: Click Simulate Live Feed to watch live crowd check-ins stream across the interface.

📄 License

Distributed under the MIT License. See LICENSE for more information.
