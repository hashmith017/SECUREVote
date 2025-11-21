const usersDiv = document.getElementById("users");
const votesDiv = document.getElementById("votes");
const updateCandidatesButton = document.getElementById("updateCandidates");
const searchBox = document.getElementById("searchBox");
const logoutBtn = document.getElementById("logoutBtn");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const setPeriodButton = document.getElementById("setPeriod");
const periodStatus = document.getElementById("periodStatus");
const electionTitleInput = document.getElementById("electionTitleInput");
const setTitleBtn = document.getElementById("setTitleBtn");
const titleStatus = document.getElementById("titleStatus");
const electionDescriptionInput = document.getElementById("electionDescriptionInput");
const setDescriptionBtn = document.getElementById("setDescriptionBtn");
const descriptionStatus = document.getElementById("descriptionStatus");
const resetElectionBtn = document.getElementById("resetElectionBtn");
const turnoutStatus = document.getElementById("turnoutStatus");
const candidatesStatus = document.getElementById("candidatesStatus");
const paginationControls = document.getElementById("paginationControls");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const viewChainBtn = document.getElementById("viewChainBtn");
const chainContainer = document.getElementById("chainContainer");
const chainValidity = document.getElementById("chainValidity");

const token = localStorage.getItem("token");
let currentPage = 1;
const usersPerPage = 5;
let selectedCandidatesState = {};
let searchDebounceTimer;

if (!token) window.location.href = "login.html";

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

searchBox.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        fetchUsers(1);
    }, 300);
});

setTitleBtn.addEventListener("click", () => handleUpdate("title", { title: electionTitleInput.value }, titleStatus));
setDescriptionBtn.addEventListener("click", () => handleUpdate("description", { description: electionDescriptionInput.value }, descriptionStatus));
setPeriodButton.addEventListener("click", () => handleUpdate("period", { startTime: startTimeInput.value, endTime: endTimeInput.value }, periodStatus));
resetElectionBtn.addEventListener("click", handleReset);
updateCandidatesButton.addEventListener("click", handleUpdateCandidates);
exportCsvBtn.addEventListener("click", exportResults);
viewChainBtn.addEventListener("click", fetchAndRenderChain);

const handleUpdate = async (endpoint, body, statusElement, successMessage) => {
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: token
            },
            body: JSON.stringify(body)
        });
        if (response.ok && statusElement) {
            statusElement.textContent = successMessage || '✅ Saved successfully!';
            statusElement.style.color = 'green';
            setTimeout(() => { statusElement.textContent = ''; fetchFullState(); }, 2500);
        } else if (statusElement) {
            statusElement.textContent = '⚠️ Update failed.';
            statusElement.style.color = 'red';
            setTimeout(() => { statusElement.textContent = '' }, 2500);
        }
    } catch (error) {
        if (statusElement) statusElement.textContent = '⚠️ Network error.';
    }
};

async function handleUpdateCandidates() {
    const selectedCandidatesArray = Object.keys(selectedCandidatesState).map(username => ({
        name: username,
        profile: selectedCandidatesState[username].profile
    }));
    const count = selectedCandidatesArray.length;
    const message = `✅ Successfully updated. ${count} candidate(s) selected.`;
    await handleUpdate("candidates", selectedCandidatesArray, candidatesStatus, message);
}

async function handleReset() {
    if (confirm("Are you sure you want to reset the entire election?")) {
        await fetch("http://localhost:3000/api/reset", { 
            method: "POST", 
            headers: { Authorization: token }
        });
        electionTitleInput.value = '';
        electionDescriptionInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
        selectedCandidatesState = {};
        fetchFullState();
        fetchUsers(1);
        chainContainer.textContent = '';
        chainValidity.textContent = '';
    }
}

const fetchFullState = async () => {
    try {
        const electionRes = await fetch("http://localhost:3000/api/election", { headers: { Authorization: token } });
        const election = await electionRes.json();
        electionTitleInput.value = election.title || '';
        electionDescriptionInput.value = election.description || '';
        if (election.period.start && election.period.end) {
            const start = new Date(election.period.start);
            const end = new Date(election.period.end);
            periodStatus.textContent = `Current period: ${start.toLocaleString()} → ${end.toLocaleString()}`;
            startTimeInput.value = toDateTimeLocal(start);
            endTimeInput.value = toDateTimeLocal(end);
        } else {
            periodStatus.textContent = "ℹ️ No voting period is currently set.";
        }
        const turnoutRes = await fetch("http://localhost:3000/api/turnout", { headers: { Authorization: token } });
        const turnout = await turnoutRes.json();
        const percentage = turnout.eligible > 0 ? ((turnout.cast / turnout.eligible) * 100).toFixed(1) : 0;
        turnoutStatus.textContent = `Votes Cast: ${turnout.cast} / ${turnout.eligible} (${percentage}%)`;
    } catch (error) {
        turnoutStatus.textContent = "Error fetching election data.";
    }
};

const fetchUsers = async (page = 1) => {
    try {
        const searchQuery = searchBox.value;
        const url = new URL('http://localhost:3000/api/users');
        url.searchParams.append('page', page);
        url.searchParams.append('limit', usersPerPage);
        if (searchQuery) {
            url.searchParams.append('search', searchQuery);
        }
        const usersRes = await fetch(url.toString(), {
            headers: { Authorization: token }
        });
        const data = await usersRes.json();
        currentPage = page;
        renderUsers(data.users);
        renderPagination(data.totalPages);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        usersDiv.innerHTML = "Could not load the user list.";
    }
};

const renderUsers = (users) => {
    usersDiv.innerHTML = "";
    users.forEach(user => {
        const isChecked = selectedCandidatesState.hasOwnProperty(user);
        const profileText = isChecked ? selectedCandidatesState[user].profile : '';
        const userDiv = document.createElement("div");
        userDiv.className = 'user-entry';
        userDiv.innerHTML = `
            <div>
                <input type="checkbox" id="${user}" value="${user}" ${isChecked ? 'checked' : ''}>
                <label for="${user}">${user}</label>
            </div>
            <input type="text" placeholder="Candidate profile..." class="profile-input" value="${profileText}">`;
        
        const checkbox = userDiv.querySelector('input[type="checkbox"]');
        const profileInput = userDiv.querySelector('input[type="text"]');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                selectedCandidatesState[user] = { profile: profileInput.value };
            } else {
                delete selectedCandidatesState[user];
            }
        });
        profileInput.addEventListener('input', () => {
            if (checkbox.checked) {
                selectedCandidatesState[user].profile = profileInput.value;
            }
        });
        usersDiv.appendChild(userDiv);
    });
};

const renderPagination = (totalPages) => {
    paginationControls.innerHTML = '';
    if (totalPages <= 1) return;
    const prevButton = document.createElement('button');
    prevButton.textContent = '« Previous';
    prevButton.className = 'pagination-btn';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => fetchUsers(currentPage - 1);
    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    pageIndicator.className = 'pagination-indicator';
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next »';
    nextButton.className = 'pagination-btn';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => fetchUsers(currentPage + 1);
    paginationControls.append(prevButton, pageIndicator, nextButton);
};

const renderLiveResults = (candidates) => {
    votesDiv.innerHTML = "";
    if (Object.keys(candidates).length === 0) {
        votesDiv.innerHTML = "<p>No candidates selected yet.</p>";
        return;
    }
    const sortedCandidates = Object.entries(candidates)
        .map(([name, data]) => ({ name, votes: data.votes }))
        .sort((a, b) => b.votes - a.votes);
    const totalVotes = sortedCandidates.reduce((sum, c) => sum + c.votes, 0);
    if (totalVotes === 0) {
        votesDiv.innerHTML = "<p>No votes have been cast yet.</p>";
        return;
    }
    sortedCandidates.forEach((candidate, index) => {
        const percentage = ((candidate.votes / totalVotes) * 100).toFixed(1);
        const isLeading = index === 0 && candidate.votes > 0;
        const entryDiv = document.createElement("div");
        entryDiv.className = 'leaderboard-entry';
        if (isLeading) entryDiv.classList.add('leading');
        entryDiv.innerHTML = `
            <div class="leaderboard-label">
                <strong>${candidate.name}</strong>
                <span>${candidate.votes} votes (${percentage}%)</span>
            </div>
            <div class="leaderboard-bar-container">
                <div class="leaderboard-bar" style="width: ${percentage}%;"></div>
            </div>`;
        votesDiv.appendChild(entryDiv);
    });
};

const fetchAndRenderResults = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/election", { headers: { Authorization: token } });
        const electionData = await res.json();
        renderLiveResults(electionData.candidates);
    } catch (error) {
        console.error("Failed to fetch live results:", error);
    }
};

async function exportResults() {
    const response = await fetch('http://localhost:3000/api/export', {
        headers: { Authorization: token }
    });
    if (!response.ok) {
        alert('Failed to export results.');
        return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'election-results.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

async function fetchAndRenderChain() {
    try {
        const res = await fetch("http://localhost:3000/api/chain", { headers: { Authorization: token } });
        const data = await res.json();
        
        chainContainer.textContent = JSON.stringify(data.chain, null, 2);
        
        if (data.isValid) {
            chainValidity.textContent = "✅ Chain is valid.";
            chainValidity.style.color = "green";
        } else {
            chainValidity.textContent = "⛔ CHAIN IS INVALID!";
            chainValidity.style.color = "red";
        }
    } catch (error) {
        chainContainer.textContent = "Failed to load chain.";
    }
}

const toDateTimeLocal = (date) => {
    if (!date) return "";
    const ten = (i) => (i < 10 ? '0' : '') + i;
    return `${date.getFullYear()}-${ten(date.getMonth() + 1)}-${ten(date.getDate())}T${ten(date.getHours())}:${ten(date.getMinutes())}`;
};

const loadInitialState = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/election", { headers: { Authorization: token } });
        const electionData = await res.json();
        Object.keys(electionData.candidates).forEach(username => {
            selectedCandidatesState[username] = {
                profile: electionData.candidates[username].profile || ''
            };
        });
    } catch (error) {
        console.error("Failed to load initial state:", error);
    }
    fetchUsers(1); 
};

loadInitialState();
fetchFullState();
fetchAndRenderResults();
setInterval(fetchAndRenderResults, 5000);