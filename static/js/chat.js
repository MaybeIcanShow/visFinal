function toggleChat() {
    var chatContainer = document.getElementById("chat-container");
    chatContainer.style.display = chatContainer.style.display === "none" ? "block" : "none";
}

function sendMessage() {
    var messageInput = document.getElementById("message-input");
    var message = messageInput.value;
    if (message.trim() !== "") {
        var chatBox = document.getElementById("chat-box");

        // 添加用户消息
        var userMessageElement = document.createElement("div");
        userMessageElement.textContent = message;
        userMessageElement.classList.add("user-message");
        var userAvatarElement = document.createElement("div");
        userAvatarElement.textContent = "You";
        userAvatarElement.classList.add("user-avatar");
        userMessageElement.appendChild(userAvatarElement);
        chatBox.appendChild(userMessageElement);

        messageInput.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;

        // 发送消息给 Flask 服务器
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
            .then(response => response.json())
            .then(data => {
                // 接收服务器的响应并显示在聊天窗口中
                var responseMessage = data.message;
                var responseElement = document.createElement("div");
                responseElement.textContent = responseMessage;
                responseElement.classList.add("system-message");
                var systemAvatarElement = document.createElement("div");
                systemAvatarElement.textContent = "Bot";
                systemAvatarElement.classList.add("system-avatar");
                responseElement.insertBefore(systemAvatarElement, responseElement.firstChild);
                chatBox.appendChild(responseElement);
                chatBox.scrollTop = chatBox.scrollHeight;
            })
            .catch(error => console.error('Error:', error));
    }
}