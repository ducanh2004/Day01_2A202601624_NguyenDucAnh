document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const btn = document.getElementById('send-btn');
    
    // Stats elements
    const statTurns = document.getElementById('stat-turns');
    const statTokens = document.getElementById('stat-tokens');
    const statCost = document.getElementById('stat-cost');
    
    const personaInput = document.getElementById('persona-input');
    const modelSelect = document.getElementById('model-select');

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user';
        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-user"></i></div>
            <div class="bubble">${escapeHTML(text)}</div>
        `;
        chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    function createAssistantBubble() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message assistant';
        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="bubble"><span class="content"></span><span class="cursor"></span></div>
        `;
        chatBox.appendChild(msgDiv);
        scrollToBottom();
        return msgDiv;
    }

    function scrollToBottom() {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag]));
    }

    // Auto-focus input on load
    input.focus();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // UI Updates for sending
        input.value = '';
        btn.disabled = true;
        input.disabled = true;
        
        appendUserMessage(text);
        const bubble = createAssistantBubble();
        const contentSpan = bubble.querySelector('.content');
        const cursor = bubble.querySelector('.cursor');

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    persona: personaInput.value.trim(),
                    model: modelSelect.value
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop(); // keep incomplete chunk in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6);
                        try {
                            const data = JSON.parse(dataStr);
                            
                            if (data.type === 'chunk') {
                                // Simple HTML escaping for stream
                                contentSpan.innerHTML += escapeHTML(data.content);
                                chatBox.scrollTop = chatBox.scrollHeight; // Force instant scroll while streaming
                            } else if (data.type === 'stats') {
                                // Animate numbers if possible, or just update
                                statTurns.textContent = data.turns;
                                statTokens.textContent = data.tokens.toLocaleString();
                                statCost.textContent = '$' + data.cost.toFixed(4);
                                
                                // Add a little flash animation to updated stats
                                [statTurns, statTokens, statCost].forEach(el => {
                                    el.style.color = 'var(--accent-green)';
                                    setTimeout(() => el.style.color = '', 500);
                                });
                            } else if (data.type === 'error') {
                                contentSpan.innerHTML += `<br><span style="color:#ef4444"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${escapeHTML(data.content)}</span>`;
                            }
                        } catch (err) {
                            console.error('Error parsing JSON line', err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            contentSpan.innerHTML += `<br><span style="color:#ef4444"><i class="fa-solid fa-wifi"></i> Connection Error. Is the backend running?</span>`;
        } finally {
            // Cleanup
            cursor.remove();
            btn.disabled = false;
            input.disabled = false;
            input.focus();
        }
    });
});