import React, { useState } from 'react';
import { chatWithBot, getQuickReplies } from '../api/aiApi';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    type: 'bot',
    text: 'Hi! I\'m EventSphere AI Assistant. How can I help you today?',
    suggestions: ['Upcoming events', 'My registrations', 'Prices', 'Help']
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithBot(userMessage);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: response.response,
        suggestions: response.suggestions
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I couldn\'t process your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = async (suggestion) => {
    setInput(suggestion);
    await handleSend();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <span>💬</span>
        </button>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>EventSphere AI Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <p>{msg.text}</p>
                {msg.suggestions && (
                  <div className="suggestions">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSuggestion(suggestion)}
                        disabled={loading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="message bot"><p>Thinking...</p></div>}
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
