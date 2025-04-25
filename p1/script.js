document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use default
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(savedTheme + '-mode');
    
    themeToggle.addEventListener('click', function() {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light');
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const chatArea = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const clearChat = document.getElementById("clear-chat");
  
    const backendURL = "http://localhost:8000/chat"; // Change to deployed backend if needed
  
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  
    clearChat.addEventListener("click", () => {
      chatArea.innerHTML = `
        <div class="message bot">
          <div class="message-content">
            Hello! I'm your Pet Care Assistant. How can I help you today?
          </div>
        </div>
      `;
    });
  
    async function sendMessage() {
      const message = userInput.value.trim();
      if (message === "") return;
  
      // Add the user's message
      addMessage(message, "user");
  
      // Clear input field
      userInput.value = "";
  
      // Add a loading message while waiting for the response
      const loadingMsg = addMessage("...", "bot");
  
      try {
        // Send the user's message to the backend
        const res = await fetch(backendURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user_input: message })
        });
  
        // Get the response from the backend
        const data = await res.json();
  
        // Remove the loading message
        chatArea.removeChild(loadingMsg);
  
        // Format and display the bot's response
        const formattedResponse = formatResponse(data.response);
        addMessage(formattedResponse, "bot", true);
      } catch (error) {
        // Handle any errors from the backend request
        chatArea.removeChild(loadingMsg);
        console.error("❌ Backend error:", error);
        addMessage("Oops! Something went wrong. Please try again later.", "bot");
      }
    }
  
    function addMessage(message, sender, isHTML = false) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", sender);
  
      const messageContent = document.createElement("div");
      messageContent.classList.add("message-content");
  
      if (isHTML) {
        messageContent.innerHTML = message;
      } else {
        messageContent.textContent = message;
      }
  
      messageElement.appendChild(messageContent);
      chatArea.appendChild(messageElement);
      chatArea.scrollTop = chatArea.scrollHeight;
  
      return messageElement;
    }
  
    function formatResponse(response) {
      // Convert markdown bold **text** or *text* to <strong>
      response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      response = response.replace(/\*(?!\s)(.*?)\*/g, "<strong>$1</strong>");
    
      // Convert newlines to <br> temporarily
      response = response.replace(/\n/g, "<br>");
    
      // Convert bullet points to list items
      const lines = response.split("<br>");
      let inList = false;
      const formattedLines = [];
    
      for (let line of lines) {
        if (/^(\s*[-*])\s+/.test(line)) {
          if (!inList) {
            formattedLines.push("<ul>");
            inList = true;
          }
          formattedLines.push(`<li>${line.replace(/^(\s*[-*])\s+/, "")}</li>`);
        } else {
          if (inList) {
            formattedLines.push("</ul>");
            inList = false;
          }
          formattedLines.push(line);
        }
      }
      if (inList) formattedLines.push("</ul>");
    
      return formattedLines.join("<br>");
    }
  });
  