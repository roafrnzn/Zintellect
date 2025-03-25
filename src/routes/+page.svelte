<script lang="ts">
    import { onMount } from 'svelte';
    import MarkdownIt from 'markdown-it';
    
    interface Message {
      role: 'user' | 'assistant' | 'system';
      content: string;
      isIntro?: boolean;
      timestamp?: string;
    }
    
    let messages: Message[] = [];
    let input = '';
    let chatContainer: HTMLElement;
    let isLoading = false;
    const md = new MarkdownIt();
    
    // Get current time for timestamps
    const getTimeString = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert to 12-hour format
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };
    
    async function fetchUserData() {
      try {
        const response = await fetch('/api/generate');
        if (!response.ok) throw new Error('Failed to fetch user data');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    
    async function handleSubmit() {
      if (!input.trim()) return;
  
      if (showIntroMessage) {
        showIntroMessage = false;
        messages = messages.filter((msg) => !msg.isIntro);
      }
  
      const userMessage = input.trim();
      messages = [...messages, { 
        role: 'user', 
        content: userMessage,
        timestamp: getTimeString()
      }];
      input = '';
      isLoading = true;
  
      scrollToBottom();
  
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage }),
        });
  
        if (!response.ok) throw new Error('Failed to get response');
  
        const data = await response.json();
        let cleanedMessage = data.response || '';
  
        cleanedMessage = cleanedMessage.replace(/<think>[\s\S]*?<\/think>/g, '');
        cleanedMessage = cleanedMessage.replace(/^<p>|<\/p>$/g, '').trim();
        cleanedMessage = cleanedMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        cleanedMessage = cleanedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
        cleanedMessage = cleanedMessage.replace(/__(.*?)__/g, '<u>$1</u>');
        cleanedMessage = cleanedMessage.replace(/\s+/g, ' ').trim();
  
        messages = [
          ...messages,
          {
            role: 'assistant',
            content: cleanedMessage,
            timestamp: getTimeString()
          }
        ];
  
        scrollToBottom();
      } catch (error) {
        console.error('Error:', error);
        messages = [
          ...messages,
          { 
            role: 'assistant', 
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: getTimeString()
          }
        ];
      } finally {
        isLoading = false;
        scrollToBottom();
      }
    }
  
    function scrollToBottom() {
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 50);
    }
    
    let showIntroMessage = true; // Controls whether the intro message is displayed
  
    onMount(async () => {
      await fetchUserData();
      
      // Add initial greeting if no messages exist
      messages = [
        {
          role: 'assistant',
          content: `<div class="intro-message">
                      <p>Hello, I'm Zintellect! Ready to chat?</p>
                    </div>`,
          isIntro: true,
          timestamp: getTimeString()
        }
      ];
    });
  </script>
  
  <div class="chat-app">
    <!-- Rose Quartz and Serenity background -->
    <div class="bg-gradient"></div>
    <div class="decorative-elements">
      <div class="soft-circle circle-1"></div>
      <div class="soft-circle circle-2"></div>
      <div class="soft-circle circle-3"></div>
      <div class="soft-circle circle-4"></div>
    </div>
    
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <div class="logo">
          <div class="logo-icon">
            <div class="logo-dot"></div>
            <div class="logo-ring"></div>
          </div>
          <span class="logo-text">Zintellect</span>
        </div>
      </div>
      
      <!-- Messages Area -->
      <div class="messages-container" bind:this={chatContainer}>
        {#each messages as message}
          <div class="message-wrapper {message.role === 'user' ? 'user' : 'bot'} {message.isIntro ? 'intro' : ''}">
            {#if message.role === 'assistant' && !message.isIntro}
              <div class="avatar bot-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a3cb5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                  <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
                  <path d="M12 12 2 12"></path>
                  <path d="M12 12v10"></path>
                </svg>
              </div>
            {/if}
            
            <div class="message {message.role === 'user' ? 'user-message' : 'bot-message'}">
              <div class="message-content">{@html message.content}</div>
              {#if message.timestamp && !message.isIntro}
                <span class="timestamp">{message.timestamp}</span>
              {/if}
            </div>
            
            {#if message.role === 'user'}
              <div class="avatar user-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            {/if}
          </div>
        {/each}
        
        {#if isLoading}
          <div class="message-wrapper bot">
            <div class="avatar bot-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a3cb5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
                <path d="M12 12 2 12"></path>
                <path d="M12 12v10"></path>
              </svg>
            </div>
            
            <div class="message bot-message typing-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Input Area -->
      <form class="input-container" on:submit|preventDefault={handleSubmit}>
        <div class="input-wrapper">
          <input 
            type="text"
            bind:value={input} 
            placeholder="Type your message..."
            disabled={isLoading}
          />
          
          <button 
            type="submit" 
            class="send-button" 
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>
  
  <style>
    :global(body) {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: #333333;
      height: 100vh;
      overflow: hidden;
    }
    
    /* Main container */
    .chat-app {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100%;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }
    
    /* Rose Quartz and Serenity background */
    .bg-gradient {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #F7CAC9 0%, #92A8D1 100%);
      z-index: -2;
    }
  
    /* Decorative elements for the Rose Quartz and Serenity theme */
    .decorative-elements {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      overflow: hidden;
    }
  
    .soft-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.4;
      filter: blur(60px);
    }
  
    .circle-1 {
      width: 500px;
      height: 500px;
      background: #F7CAC9;
      top: -100px;
      left: -100px;
    }
  
    .circle-2 {
      width: 400px;
      height: 400px;
      background: #92A8D1;
      bottom: -100px;
      right: -100px;
    }
  
    .circle-3 {
      width: 300px;
      height: 300px;
      background: #F7CAC9;
      top: 40%;
      right: 20%;
    }
  
    .circle-4 {
      width: 350px;
      height: 350px;
      background: #92A8D1;
      bottom: 30%;
      left: 10%;
    }
    
    /* Chat container with glass effect */
    .chat-container {
      width: 100%;
      max-width: 700px;
      height: 80vh;
      display: flex;
      flex-direction: column;
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(255, 255, 255, 0.8) inset,
        0 0 0 3px rgba(106, 60, 181, 0.1);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      animation: containerAppear 1s ease-out;
    }
    
    /* Header styling */
    .chat-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(106, 60, 181, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(5px);
      z-index: 10;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-icon {
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-dot {
      width: 10px;
      height: 10px;
      background-color: #6a3cb5;
      border-radius: 50%;
      animation: pulse 3s infinite;
      box-shadow: 0 0 10px rgba(106, 60, 181, 0.5);
      z-index: 2;
    }
    
    .logo-ring {
      position: absolute;
      width: 24px;
      height: 24px;
      border: 2px solid rgba(106, 60, 181, 0.5);
      border-radius: 50%;
      animation: ringPulse 3s infinite;
    }
    
    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6a3cb5, #5d2e9e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    
    /* Messages area */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      scroll-behavior: smooth;
      position: relative;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(106, 60, 181, 0.03) 0%, transparent 20%),
        radial-gradient(circle at 90% 50%, rgba(106, 60, 181, 0.03) 0%, transparent 20%),
        radial-gradient(circle at 40% 80%, rgba(106, 60, 181, 0.03) 0%, transparent 20%);
    }
    
    /* Message styling */
    .message-wrapper {
      display: flex;
      width: 100%;
      animation: messageAppear 0.4s ease-out;
      align-items: flex-end;
      gap: 0.75rem;
    }
    
    .message-wrapper.user {
      justify-content: flex-end;
    }
    
    .message-wrapper.bot {
      justify-content: flex-start;
    }
    
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .bot-avatar {
      background-color: rgba(106, 60, 181, 0.1);
      border: 1px solid rgba(106, 60, 181, 0.3);
    }
    
    .user-avatar {
      background-color: #6a3cb5;
      border: 1px solid rgba(106, 60, 181, 0.7);
    }
    
    .message {
      padding: 0.75rem 1rem;
      border-radius: 18px;
      max-width: 75%;
      position: relative;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .user-message {
      background-color: #6a3cb5;
      color: white;
      border-top-right-radius: 4px;
    }
    
    .bot-message {
      background-color: rgba(255, 255, 255, 0.8);
      color: #333;
      border: 1px solid rgba(106, 60, 181, 0.2);
      border-top-left-radius: 4px;
    }
    
    .message-content {
      word-break: break-word;
      line-height: 1.5;
    }
    
    .timestamp {
      display: block;
      font-size: 0.7rem;
      margin-top: 0.5rem;
      opacity: 0.7;
      text-align: right;
    }
    
    /* Typing indicator */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      background-color: rgba(106, 60, 181, 0.6);
      border-radius: 50%;
      animation: bounce 1.5s infinite;
    }
    
    .dot:nth-child(2) {
      animation-delay: 0.15s;
    }
    
    .dot:nth-child(3) {
      animation-delay: 0.3s;
    }
    
    /* Input area */
    .input-container {
      padding: 1rem;
      border-top: 1px solid rgba(106, 60, 181, 0.1);
      background-color: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(5px);
    }
    
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 9999px;
      padding: 0.5rem 1rem;
      border: 1px solid rgba(106, 60, 181, 0.2);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.5rem 0;
      outline: none;
      color: #333;
      font-size: 0.95rem;
    }
    
    input::placeholder {
      color: #999;
    }
    
    .send-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #6a3cb5;
      color: white;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .send-button:hover {
      background-color: #5d2e9e;
      transform: scale(1.05);
    }
    
    .send-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      transform: none;
    }
    
    .send-button svg {
      width: 16px;
      height: 16px;
    }
    
    /* Intro message styling */
    .intro-message p {
      font-size: 1.1rem;
      font-weight: 500;
      color: #6a3cb5;
    }
    
    /* Animations */
    @keyframes containerAppear {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes messageAppear {
      0% {
        opacity: 0;
        transform: translateY(10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }
    
    @keyframes ringPulse {
      0%, 100% {
        opacity: 0.5;
        transform: scale(1);
      }
      50% {
        opacity: 0.3;
        transform: scale(1.1);
      }
    }
    
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .chat-container {
        height: 100vh;
        max-width: 100%;
        border-radius: 0;
      }
      
      .message {
        max-width: 85%;
      }
    }
    
    @media (max-width: 480px) {
      .chat-header {
        padding: 1rem;
      }
      
      .messages-container {
        padding: 1rem;
      }
      
      .message {
        max-width: 90%;
      }
      
      .logo-text {
        font-size: 1.25rem;
      }
    }
  </style>