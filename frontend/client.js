const token = localStorage.getItem("token"); // Get token from localStorage

if (!token) {
    window.location.href = "login.html";
} else {
    const candidatesDiv = document.getElementById("candidates");
    const statusDiv = document.getElementById("status");
    const logoutBtn = document.getElementById("logoutBtn");
    const titleDisplay = document.getElementById("electionTitleDisplay");
    const descriptionDisplay = document.getElementById("electionDescriptionDisplay");
    const abstainBtn = document.getElementById("abstainBtn");

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token"); // Remove token
        window.location.href = "login.html";
    });

    abstainBtn.addEventListener("click", () => vote("ABSTAIN"));

    let hasVoted = false;

    const fetchElectionState = async () => {
        try {
            const statusRes = await fetch("http://localhost:3000/api/votestatus", { 
                headers: { "Authorization": token } // Add auth header
            });
            const statusResult = await statusRes.json();
            if (statusResult.success) hasVoted = statusResult.hasVoted;

            const electionRes = await fetch("http://localhost:3000/api/election", { 
                headers: { "Authorization": token } // Add auth header
            });
            const electionData = await electionRes.json();
            
            titleDisplay.textContent = electionData.title || "Election";
            descriptionDisplay.textContent = electionData.description || "Please cast your vote below.";

            const { candidates, period } = electionData;
            const now = new Date();
            const start = period.start ? new Date(period.start) : null;
            const end = period.end ? new Date(period.end) : null;

            if (!start || !end) {
                statusDiv.textContent = "⚠️ Voting period has not been set by the admin.";
                candidatesDiv.innerHTML = "";
                abstainBtn.style.display = 'none';
                return;
            }
            
            if (now < start) {
                statusDiv.textContent = "🕒 Voting hasn’t started yet.";
                candidatesDiv.innerHTML = "";
                abstainBtn.style.display = 'none';
            } else if (now > end) {
                statusDiv.textContent = "⛔ Voting has ended. Results:";
                renderResults(candidates);
                abstainBtn.style.display = 'none';
            } else {
                statusDiv.textContent = "Please cast your vote."; 
                renderCandidates(candidates);
                abstainBtn.style.display = 'block';
                abstainBtn.disabled = hasVoted;
            }
        } catch (error) {
            console.error("Failed to fetch election state:", error);
            statusDiv.textContent = "⚠️ Could not connect to the server.";
        }
    };

    const renderCandidates = (candidates) => {
        candidatesDiv.innerHTML = "";
        abstainBtn.disabled = hasVoted;
        if (hasVoted) statusDiv.textContent = "✅ You have already voted.";

        for (const name in candidates) {
            const profile = candidates[name].profile;
            const candidateDiv = document.createElement("div");
            candidateDiv.className = "candidate";
            const infoDiv = document.createElement("div");
            infoDiv.className = "candidate-info";
            const nameSpan = document.createElement("span");
            nameSpan.className = "candidate-name";
            nameSpan.textContent = name;
            const profileP = document.createElement("p");
            profileP.className = "candidate-profile";
            profileP.textContent = profile || 'No profile provided.';
            infoDiv.append(nameSpan, profileP); // Use append for multiple elements
            const voteButton = document.createElement("button");
            voteButton.textContent = "Vote";
            voteButton.disabled = hasVoted;
            voteButton.onclick = () => vote(name);
            candidateDiv.append(infoDiv, voteButton); // Use append
            candidatesDiv.appendChild(candidateDiv);
        }
    };

    const renderResults = (candidates) => {
        candidatesDiv.innerHTML = "";
        let totalVotes = 0;
        // Calculate total votes correctly
        Object.values(candidates).forEach(c => totalVotes += c.votes); 

        for (const name in candidates) {
            const c = candidates[name];
            const percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
            const resultDiv = document.createElement("div");
            resultDiv.className = 'result-entry';
            resultDiv.innerHTML = `
                <div class="result-label">${name} (${c.votes} votes)</div>
                <div class="result-bar-container">
                    <div class="result-bar" style="width: ${percentage}%;"></div>
                </div>
                <div class="result-percentage">${percentage}%</div>
            `;
            candidatesDiv.appendChild(resultDiv);
        }
    };

    const vote = async (candidate) => {
        const choice = candidate === "ABSTAIN" ? "abstain from this vote" : `vote for ${candidate}`;
        const confirmed = confirm(`Are you sure you want to ${choice}?\nThis action cannot be undone.`);
        
        if (confirmed) {
            const response = await fetch("http://localhost:3000/api/vote", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": token // Add auth header
                },
                body: JSON.stringify({ candidate })
            });
            const result = await response.json();
            
            if (result.success) {
                // --- Disable buttons immediately ---
                document.querySelectorAll('.candidate button').forEach(button => button.disabled = true);
                abstainBtn.disabled = true;
                statusDiv.textContent = "✅ Vote successfully recorded!"; 
                // --- End disable ---
                
                fetchElectionState(); // Fetch state again
            } else {
                statusDiv.textContent = `⚠️ ${result.message}`;
            }
        }
    };
    
    fetchElectionState();
}