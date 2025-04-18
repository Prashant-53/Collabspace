if (!localStorage.getItem('user')) {
    window.location.href = 'login.html';
  }
  
  const user = localStorage.getItem('user');
document.getElementById('accountUsername').textContent = user ?? 'Guest';

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const chatInput = document.querySelector('.chat-input input');
    const chatSendBtn = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');
    const startVideoBtn = document.getElementById('startVideoBtn');
    const videoTab = document.querySelector('[data-tab="video"]');
    const taskLists = document.querySelectorAll('.task-list');
    const tabContents = document.querySelectorAll('.tab-content');

    // Socket.IO setup
    const socket = io();

    // Display initial messages from server
    socket.on('initial messages', (msgs) => {
        msgs.forEach(addMessageToChat);
    });

    // When receiving a new message
    socket.on('chat message', (msg) => {
        addMessageToChat(msg);
    });

    // Send message to server
    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (text !== '') {
            const msg = { user: 'You', text };
            socket.emit('chat message', msg);
            chatInput.value = '';
        }
    };

    // Send on button click or Enter
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Append message to UI
    function addMessageToChat(msg) {
        const messageDiv = document.createElement('div');
        const isCurrentUser = msg.user === localStorage.getItem('user');
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
        messageDiv.classList.add('message');
        messageDiv.classList.add(isCurrentUser ? 'sent' : 'received');
      
        messageDiv.innerHTML = `
          <strong>${msg.user}:</strong> ${msg.text}
          <div class="timestamp">${time}</div>
        `;
      
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));

            tab.classList.add('active');
            const targetId = tab.dataset.tab + '-tab';
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // Video call tab shortcut
    startVideoBtn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        videoTab.classList.add('active');
        tabContents.forEach(c => c.classList.add('hidden'));
        document.getElementById('video-tab').classList.remove('hidden');
    });

    // Drag and Drop Tasks
    const setupDragAndDrop = () => {
        document.querySelectorAll('.task-card').forEach(card => {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', dragStart);
        });
    };

    const dragStart = (e) => {
        e.dataTransfer.setData('text/plain', e.target.outerHTML);
        e.dataTransfer.dropEffect = 'move';
        setTimeout(() => {
            e.target.style.display = 'none';
        }, 0);
    };

    taskLists.forEach(list => {
        list.addEventListener('dragover', (e) => e.preventDefault());

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            const html = e.dataTransfer.getData('text/plain');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const newCard = tempDiv.firstElementChild;

            if (newCard) {
                newCard.style.display = 'block';
                newCard.setAttribute('draggable', true);
                newCard.addEventListener('dragstart', dragStart);
                list.appendChild(newCard);
            }
        });
    });

    setupDragAndDrop();
});
