const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Blockchain, Block } = require("./blockchain.js");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || "supersecretkey_dev";

let users = [
    { username: "pro", passwordHash: bcrypt.hashSync("pass", 10), role: "admin" },
];
for (let i = 1; i <= 100; i++) {
    users.push({ username: `user${i}`, passwordHash: bcrypt.hashSync(`pass${i}`, 10), role: "user" });
}

let election = {
    title: "ELECTIONS 2025",
    description: "WELCOME TO ELECTION 2025. PLEASE VOTE WISELY.",
    candidates: {}, 
    voted: {},
    votingPeriod: { start: null, end: null }
};

let voteLedger = new Blockchain();

function auth(requiredRole) {
    return (req, res, next) => {
        const token = req.headers["authorization"];
        if (!token) return res.status(401).json({ success: false, message: "Missing token" });
        try {
            const decoded = jwt.verify(token, SECRET);
            req.user = decoded;
            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ success: false, message: "Forbidden" });
            }
            next();
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
    };
}

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: "Invalid credentials" });
    
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.json({ success: false, message: "Invalid credentials" });

    const otp = "123456";
    otpStore[username] = { otp: otp, expires: Date.now() + 300000 };

    return res.json({ 
        success: true, 
        otpSent: true, 
        username: user.username,
        fakeOtp: otp
    });
});

let otpStore = {};

app.post("/api/verify-otp", (req, res) => {
    const { username, otp } = req.body;
    const stored = otpStore[username];

    if (!stored) {
        return res.json({ success: false, message: "OTP not found. Please log in again." });
    }
    if (Date.now() > stored.expires) {
        delete otpStore[username];
        return res.json({ success: false, message: "OTP has expired. Please log in again." });
    }
    if (otp !== stored.otp) {
        return res.json({ success: false, message: "Invalid OTP." });
    }

    const user = users.find(u => u.username === username);
    const token = jwt.sign({ username: user.username, role: user.role }, SECRET, { expiresIn: "8h" });
    
    delete otpStore[username]; 
    return res.json({ success: true, token, role: user.role });
});

app.get("/api/users", auth("admin"), (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = (req.query.search || "").toLowerCase();
    const regularUsers = users.filter(user => user.role === 'user').map(u => u.username);
    const filteredUsers = searchQuery
        ? regularUsers.filter(username => username.toLowerCase().includes(searchQuery))
        : regularUsers;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / limit);
    return res.json({
        users: paginatedUsers,
        totalPages: totalPages
    });
});

app.get("/api/election", auth(), (req, res) => {
    return res.json({
        title: election.title,
        description: election.description,
        candidates: election.candidates,
        period: election.votingPeriod
    });
});

app.get("/api/turnout", auth("admin"), (req, res) => {
    const eligibleCount = users.filter(u => u.role === 'user').length;
    const castCount = Object.keys(election.voted).length;
    return res.json({ eligible: eligibleCount, cast: castCount });
});

app.post("/api/title", auth("admin"), (req, res) => {
    election.title = req.body.title || "No Title Set";
    return res.json({ success: true });
});

app.post("/api/description", auth("admin"), (req, res) => {
    election.description = req.body.description || "";
    return res.json({ success: true });
});

app.post("/api/candidates", auth("admin"), (req, res) => {
    const list = req.body; 
    if (!Array.isArray(list)) return res.json({ success: false, message: "Expected an array" });
    const newCandidates = {};
    list.forEach(c => {
        newCandidates[c.name] = { votes: 0, profile: c.profile || "" };
    });
    election.candidates = newCandidates;
    election.voted = {};
    return res.json({ success: true });
});

app.post("/api/period", auth("admin"), (req, res) => {
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) return res.json({ success: false, message: "Missing start/end time" });
    election.votingPeriod.start = new Date(startTime);
    election.votingPeriod.end = new Date(endTime);
    return res.json({ success: true });
});

app.post("/api/vote", auth("user"), (req, res) => {
    const username = req.user.username;
    const { candidate } = req.body;
    const now = new Date();
    
    if (!election.votingPeriod.start || !election.votingPeriod.end || now < election.votingPeriod.start || now > election.votingPeriod.end) {
        return res.json({ success: false, message: "Voting is not allowed at this time" });
    }
    if (election.voted[username]) {
        return res.json({ success: false, message: "You have already voted" });
    }
    
    let blockData; 
    if (candidate === "ABSTAIN") {
        election.voted[username] = true; 
        blockData = { action: "Vote Cast", choice: "ABSTAIN" }; 
    } else if (election.candidates.hasOwnProperty(candidate)) {
        election.candidates[candidate].votes += 1;
        election.voted[username] = true;
        blockData = { action: "Vote Cast", choice: candidate }; 
    } else {
        return res.json({ success: false, message: "Invalid candidate" });
    }
    voteLedger.addBlock(new Block(new Date().toISOString(), blockData));
    
    return res.json({ success: true, message: "Vote counted" });
});

app.get("/api/votestatus", auth("user"), (req, res) => {
    const userHasVoted = !!election.voted[req.user.username];
    return res.json({ success: true, hasVoted: userHasVoted });
});

app.post("/api/reset", auth("admin"), (req, res) => {
    election = {
        title: "No Title Set", description: "", candidates: {},
        voted: {}, votingPeriod: { start: null, end: null }
    };
    voteLedger = new Blockchain();
    return res.json({ success: true });
});

app.get("/api/export", auth("admin"), (req, res) => {
    let csv = 'Candidate,Votes\n';
    for (const name in election.candidates) {
        csv += `${name},${election.candidates[name].votes}\n`;
    }
    res.header('Content-Type', 'text/csv');
    res.attachment('election-results.csv');
    res.send(csv);
});

app.get("/api/chain", auth("admin"), (req, res) => {
    return res.json({
        chain: voteLedger.chain,
        isValid: voteLedger.isChainValid()
    });
});

app.listen(PORT, () => console.log(`✅ SECUREVote backend running on http://localhost:${PORT}`));