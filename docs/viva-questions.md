# Cloud Computing CA2: Viva Questions & Model Answers

These questions cover all key topics examiners test during evaluation: **Three-Tier Architecture**, **Cloud Platforms (Netlify, Render, Atlas)**, **REST APIs**, **CORS**, **NoSQL/MongoDB**, **MCP**, and **Security**.

---

### Q1. What is Three-Tier Architecture, and how is it implemented in this project?
* **English Answer:** Three-Tier Architecture is a client-server software architecture pattern that separates an application into three logical and physical computing tiers:
  1. **Presentation Tier (Frontend):** Implemented using HTML5, CSS3, and Vanilla JavaScript hosted on **Netlify**. It handles UI display and user interaction.
  2. **Application Tier (Backend):** Implemented using Node.js and Express.js hosted as a Web Service on **Render**. It processes business logic, REST APIs, and data validation.
  3. **Database Tier (Storage):** Implemented using **MongoDB Atlas**, a cloud-hosted NoSQL document database (`studentDB.students`).
* **Hinglish Explanation:** Three-tier architecture ka matlab hai project ko 3 alag-alag layers me baantna taaki security aur scalability bani rahe. Frontend (Netlify) sirf UI dikhata hai, Backend (Render) sara business logic aur verification sambhalta hai, aur Database (Atlas) me sara data securely save rehta hai. Frontend direct database se connect nahi kar sakta.

---

### Q2. Why should the Presentation Tier (Frontend) never connect directly to MongoDB?
* **English Answer:** Allowing the client-side browser to connect directly to the database introduces severe security vulnerabilities:
  1. It requires embedding database credentials (username/password or connection string) in client-side JavaScript, exposing them to anyone via browser DevTools.
  2. It bypasses backend authorization and business validation rules.
  3. Anyone could write arbitrary database queries or drop collections directly from the client.
* **Hinglish Explanation:** Agar frontend direct MongoDB se judega, toh connection string aur password JavaScript code me daalna padega. Koi bhi inspect element karke password chura lega aur database delete kar dega. Isliye hamesha request pehle Express backend ke paas aati hai, jahan validation hoti hai.

---

### Q3. What is CORS (Cross-Origin Resource Sharing) and why did we configure it?
* **English Answer:** CORS is a browser security mechanism that restricts web pages from making AJAX/Fetch requests to a different domain, port, or protocol than the one serving the web page. In our deployment:
  - Frontend Origin: `https://<our-app>.netlify.app`
  - Backend Origin: `https://<our-api>.onrender.com`
  Since these domains differ, the browser blocks requests unless the Render backend explicitly sends the HTTP header `Access-Control-Allow-Origin: https://<our-app>.netlify.app`.
* **Hinglish Explanation:** Jab humara frontend Netlify par hota hai aur backend Render par, toh dono ka domain alag hota hai. Browsers security ke liye do alag domains ke beech requests block kar dete hain. Backend me `cors` middleware configure karke hum browser ko batate hain ki Netlify se aane wali requests safe hain.

---

### Q4. What is the Model Context Protocol (MCP) and what was its role in this project?
* **English Answer:** MCP is an open standard that allows AI assistants (like Antigravity) to securely communicate with development tools and data sources. In this project, we integrated the official `mongodb-mcp-server` in **read-only mode** during development so Antigravity could inspect database schemas, collection indices, and connection health directly without modifying live student records.
* **Hinglish Explanation:** MCP ek AI-to-tool protocol hai. Development ke time AI coding assistant (Antigravity) ko database ka schema aur status check karne ke liye humne MCP server configure kiya. Ye sirf developer ke computer par chalta hai, production app ka hissa nahi hai.

---

### Q5. What is the difference between MCP, the Backend REST API, and Mongoose?
* **English Answer:**
  - **MCP:** A development-time AI integration protocol used by the IDE to inspect resources.
  - **Backend REST API:** The production application tier running on Render that serves client requests over HTTP.
  - **Mongoose:** The Object Data Modeling (ODM) library running inside the backend process that executes queries against MongoDB Atlas.
* **Hinglish Explanation:** MCP sirf AI ke understanding ke liye hai. REST API humare frontend ke liye endpoints deti hai. Mongoose backend ke andar MongoDB se actual queries run karta hai.

---

### Q6. Why did we choose MongoDB Atlas over a relational database like MySQL for this project?
* **English Answer:**
  1. **Schema Flexibility & JSON Alignment:** MongoDB documents are natively represented as BSON/JSON, matching JavaScript objects used in Node.js and the frontend without complex ORM mappings.
  2. **Fully Managed Cloud Service:** Atlas provides automated failover, TLS encryption, cloud backups, and global scaling out of the box.
  3. **High Performance Querying:** Built-in secondary and compound indexing allows rapid searches across student fields.
* **Hinglish Explanation:** MongoDB me data documents (JSON) ke roop me save hota hai, jo Node.js aur JavaScript ke sath natively fit baithta hai. Atlas cloud-hosted hai, isliye hume server manage karne ki zaroorat nahi padti.

---

### Q7. Explain the REST API methods implemented in this application.
* **English Answer:**
  - `GET /api/health`: Health check endpoint verifying backend and database connectivity.
  - `GET /api/students`: Retrieves student records with optional search query and department/semester filtering.
  - `GET /api/students/:id`: Retrieves a specific student by MongoDB ObjectId or `studentId`.
  - `POST /api/students`: Validates and inserts a new student record into Atlas (HTTP 201).
  - `PUT /api/students/:id`: Validates and updates existing student details (HTTP 200).
  - `DELETE /api/students/:id`: Permanently removes a student record from the collection (HTTP 200).

---

### Q8. What HTTP status codes are used in your backend and why?
* **English Answer:**
  - `200 OK`: Successful retrieval, update, or deletion.
  - `201 Created`: Successful creation of a new student resource via `POST`.
  - `400 Bad Request`: Client sent malformed input, missing required fields, or semester outside 1–8.
  - `404 Not Found`: Requested student identifier does not exist in `studentDB`.
  - `409 Conflict`: Attempted to insert a student with a duplicate `studentId`.
  - `500 Internal Server Error`: Unexpected server or network exception.
  - `503 Service Unavailable`: Backend server is online, but database connection is disconnected.

---

### Q9. How do you prevent duplicate `studentId` entries?
* **English Answer:** We enforce uniqueness at two distinct layers:
  1. **Application Controller Layer:** Before executing `Student.create()`, the controller runs `Student.findOne({ studentId })`. If found, it immediately responds with `409 Conflict`.
  2. **Database Index Layer:** The Mongoose schema defines `studentId: { type: String, unique: true }`. MongoDB Atlas creates a unique BSON index on this field and rejects duplicates with error code `11000`.

---

### Q10. How are environment variables and secrets managed securely?
* **English Answer:**
  1. Database credentials and URLs are stored in a local `.env` file that is strictly excluded from Git tracking via `.gitignore`.
  2. A sanitized `.env.example` file is provided for documentation.
  3. On Render, `MONGODB_URI` and `FRONTEND_URL` are configured securely in the platform's Environment Variables dashboard.
  4. The codebase redacts credentials before printing database logs or returning error responses to the client.

---

### Q11. What is the role of `package.json` and `package-lock.json`?
* **English Answer:**
  - `package.json`: Manifest file specifying project metadata, start scripts (`npm start`), and top-level dependencies (`express`, `mongoose`, `cors`, etc.).
  - `package-lock.json`: Lockfile recording the exact semantic versions and dependency trees of all downloaded packages, ensuring reproducible builds across development and Render production environments.

---

### Q12. What is Netlify and why is it suitable for the Presentation Tier?
* **English Answer:** Netlify is a cloud hosting platform optimized for Jamstack and static web architectures. It serves HTML, CSS, and client-side JavaScript from a globally distributed Content Delivery Network (CDN), providing low latency, automated SSL/TLS certificates, and high availability without requiring server maintenance.

---

### Q13. What is Render and why is it used for the Application Tier?
* **English Answer:** Render is a unified cloud platform for hosting web services and background workers. We use Render's Web Service feature to execute our Node.js/Express server runtime, automatically handling incoming HTTPS traffic, SSL termination, environment variable injection, and automated restarts on failure.

---

### Q14. What happens when a user clicks the "Delete" button on the UI?
* **English Answer:**
  1. The client intercepts the click and displays a modal confirmation dialog to prevent accidental deletion.
  2. Upon confirmation, the client sends a `DELETE` request with the student's ID to `https://<render-url>/api/students/:id`.
  3. The Express controller verifies the ID, invokes `Student.findByIdAndDelete()`, and returns HTTP 200.
  4. The frontend displays a green success notification and refreshes the student table asynchronously.

---

### Q15. How does the frontend handle backend cold starts or network failures?
* **English Answer:**
  1. Render free instances sleep after 15 minutes of inactivity (cold start). The frontend navigation bar includes a dynamic health badge that queries `GET /api/health` and displays "Connecting..." or "Backend: Offline" until the server wakes up.
  2. The `api.js` client catches network errors and surfaces clear user-friendly notifications (e.g. "Unable to connect to the backend server") instead of silent failures or browser crashes.

---

### Q16. What is the difference between SQL and NoSQL databases?
* **English Answer:** SQL databases (e.g., MySQL, PostgreSQL) are relational, table-based, and enforce rigid tabular schemas with foreign keys. NoSQL databases (e.g., MongoDB) are document-oriented, storing semi-structured BSON data that allows hierarchical nesting, dynamic schema evolution, and horizontal scaling across clusters.

---

### Q17. How did you test your application before deployment?
* **English Answer:** We created an automated test suite with **Jest** and **Supertest** covering 14 integration scenarios: health check, CRUD operations, input boundary validation (semester 1–8), duplicate conflict handling (HTTP 409), 404 responses for invalid IDs, and CORS header validation. All 14 tests executed with a 100% pass rate.

---

### Q18. How can this three-tier architecture scale if user traffic increases 100x?
* **English Answer:** Because each tier is decoupled:
  1. **Presentation Tier:** Netlify's global edge CDN handles increased static traffic automatically without configuration.
  2. **Application Tier:** The Express backend on Render can be scaled horizontally by increasing the number of stateless container instances behind a load balancer.
  3. **Database Tier:** MongoDB Atlas can scale vertically (larger instance tier) or horizontally (sharded cluster with replica sets) to distribute read/write operations.
