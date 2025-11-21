# SECUREVote: Blockchain-Enabled Voting Platform

**SECUREVote** is a secure, web-based electronic voting system designed to address the transparency and auditability issues of traditional e-voting. It combines standard authentication security with a conceptual blockchain layer to create an immutable, tamper-evident audit log of all votes cast.

## 🚀 Key Features

### 1. Secure Authentication
* **Role-Based Login:** Distinct dashboards for Administrators and Voters.
* **2-Factor Authentication (2FA):** Integrated OTP (One-Time Password) verification step for all logins to prevent unauthorized access.
* **Session Management:** Uses secure tokens to manage user sessions.

<img width="974" height="382" alt="image" src="https://github.com/user-attachments/assets/2ea7a640-ef73-4531-a58b-554509e62a97" />
<img width="974" height="368" alt="image" src="https://github.com/user-attachments/assets/f382a230-9ea9-4e11-af78-66919d9bd0ee" />

### 2. Voting Interface (Client Side)
* **Real-Time Election Data:** Users see the active election title, description, and candidate profiles.
* **Voting Period Enforcement:** Voting is strictly locked before the start time and after the end time.
* **Double-Voting Prevention:** Users are restricted to exactly one vote. Attempting to vote again is blocked at both the UI and Server levels.
* **Abstain Option:** Users can choose to "Abstain," recording their attendance without selecting a specific candidate.
* **Immediate Feedback:** Voting buttons are instantly disabled upon successful submission to prevent confusion or duplicate attempts.

<img width="974" height="373" alt="image" src="https://github.com/user-attachments/assets/23e35472-e987-45a3-8d73-96a96b294836" />
<img width="486" height="185" alt="image" src="https://github.com/user-attachments/assets/4bab49ee-b2c8-41b1-b929-71e12412f75e" />

### 3. Admin Administration Panel
* **Election Management:** Set the election title, description, and precise voting time window.
* **Candidate Management:**
    * Manage a database of 100+ registered users.
    * **Pagination & Search:** Efficiently find and select candidates from large user lists via backend-optimized search.
    * **Profile Management:** Add custom manifestos or profiles for candidates.
* **Live Analytics:** View real-time turnout statistics and a dynamic leaderboard sorted by vote count.
* **Data Export:** Download final election results as a **CSV file** for offline records.
* **System Reset:** Ability to wipe all election data and start fresh.

<img width="974" height="421" alt="image" src="https://github.com/user-attachments/assets/d4b640c9-ac52-48fe-8223-fafa06f483a8" />
<img width="974" height="295" alt="image" src="https://github.com/user-attachments/assets/42a4af83-e50a-48f6-8441-ef68a486713e" />
<img width="974" height="444" alt="image" src="https://github.com/user-attachments/assets/55620623-8295-4d2f-8794-9a2a44fafaa8" />

### 4. Blockchain Audit Log 🔗
* **Immutable Record:** Every vote cast is hashed and added as a "block" to a linear blockchain ledger.
* **Tamper-Evident:** Each block contains the hash of the previous block. Any attempt to alter past votes would break the cryptographic chain, alerting the admin.
* **Privacy-Preserving:** The blockchain log is anonymized. It records *what* choice was made (Candidate Name or Abstain) but does not link it to the voter's username, preserving ballot secrecy.
* **Transparency:** Admins can view the raw blockchain JSON data to verify the integrity of the vote count.

<img width="555" height="505" alt="image" src="https://github.com/user-attachments/assets/6b9330d7-0742-4c32-a664-ca3c90e0e269" />
<img width="553" height="430" alt="image" src="https://github.com/user-attachments/assets/3a573bc8-4f85-45ed-a07d-d4bdc3584618" />
<img width="974" height="320" alt="image" src="https://github.com/user-attachments/assets/ac584afd-82e5-4236-a4ee-554e5d6c4bff" />

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3 (Glassmorphism Design), Vanilla JavaScript.
* **Backend:** Node.js, Express.js.
* **Security:** `bcrypt` (Password Hashing), `jsonwebtoken` (Auth), `crypto-js` (SHA256 for Blockchain).
* **Data Storage:** In-memory data structures (Arrays/Objects) for demonstration purposes.

---

## ⚙️ Installation & Setup

1.  **Prerequisites:** Ensure [Node.js](https://nodejs.org/) is installed on your machine.
2.  **Install Dependencies:** Open your terminal in the project folder and run:
    ```bash
    npm install express cors jsonwebtoken bcrypt crypto-js concurrently live-server
    ```
3.  **Start the Application:**
    ```bash
    npm start
    ```
    * The **Backend** will start on `http://localhost:3000`
    * The **Frontend** will automatically open at `http://127.0.0.1:8080`

<img width="607" height="437" alt="image" src="https://github.com/user-attachments/assets/74665855-9320-4f61-833a-010452000aed" />

---

## 🔑 Login Credentials (Demo)

The system is pre-loaded with 1 Admin and 100 Users.

**Admin Account:**
* **Username:** `pro`
* **Password:** `pass`

**User Accounts:**
* **Username:** `user1` to `user100`
* **Password:** `pass1` to `pass100` (e.g., `user5` has password `pass5`)

**OTP Code:**
* For demonstration purposes, the OTP is hardcoded to: **`123456`**

---

## 🛡️ Security Analysis

### Why Blockchain?
In a standard database, a malicious admin with database access could simply change a number from "40 votes" to "50 votes" without leaving a trace. In **SECUREVote**, the vote count is derived from the database, but it can be audited against the **Blockchain Log**.

If an attacker tries to change a past vote in the blockchain, the hash of that block changes. This invalidates the next block's `previousHash`, and so on, breaking the entire chain. The system detects this and flags the chain as **Invalid**.

### Future Scope (Decentralization)
Currently, the blockchain resides on the central server ("Centralized Ledger"). To make this system fully "Trustless," the backend logic would be migrated to a Smart Contract on a public network like Ethereum, distributing the ledger across thousands of nodes so no single entity controls the data.
