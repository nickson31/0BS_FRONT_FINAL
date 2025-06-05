import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { sendGuestChatMessage, sendAuthenticatedMessage, searchInvestors } from '../services/apiService';

const ChatInterface = ({ 
  currentChat, 
  currentProject, 
  user, 
  isDeepResearch,
  onInvestorsFound,
  onEmployeesFound,
  onLoginRequired 
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentChat) {
      loadMessages();
    } else {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! Soy tu asistente para encontrar inversores. ¿En qué puedo ayudarte?'
      }]);
    }
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .table('chat_messages')
      .select('*')
      .eq('chat_id', currentChat.id)
      .order('created_at');
    
    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      
      if (user && currentProject) {
        response = await sendAuthenticatedMessage(
          currentProject.id,
          currentChat?.id,
          input,
          { deep_research: isDeepResearch, file: uploadedFile }
        );
      } else {
        response = await sendGuestChatMessage(input);
      }

      // Handle different response types
      if (response.type === 'investor_results') {
        onInvestorsFound(response.data);
        
        const aiMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.follow_up_message || `He encontrado ${response.data.length} inversores que podrían ser relevantes para tu proyecto.`,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Show investor table
        const tableMessage = {
          id: Date.now() + 1,
          role: 'system',
          type: 'investor_table',
          data: response.data.slice(0, 10),
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tableMessage]);
        
      } else {
        const aiMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.data || response.message,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      
      setUploadedFile(null);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor, intenta de nuevo.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSearchEmployees = async (investorId) => {
    if (!user) {
      onLoginRequired();
      return;
    }
    
    // Implement employee search
    console.log('Searching employees for investor:', investorId);
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.type === 'investor_table' ? (
              <div className="investor-table">
                <table>
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>Ubicación</th>
                      <th>Score</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {message.data.map((investor, idx) => (
                      <tr key={idx}>
                        <td>{investor.Company_Name}</td>
                        <td>{investor.Company_Location}</td>
                        <td>{investor.Final_Score}</td>
                        <td>
                          <button 
                            className="find-employees-btn"
                            onClick={() => handleSearchEmployees(investor.id)}
                          >
                            Buscar empleados
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {message.data.length === 10 && (
                  <button className="load-more-investors">
                    Ver más inversores
                  </button>
                )}
              </div>
            ) : (
              <div className="message-content">
                {message.content}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        {uploadedFile && (
          <div className="uploaded-file">
            <span>📎 {uploadedFile.name}</span>
            <button onClick={() => setUploadedFile(null)}>✕</button>
          </div>
        )}
        
        <div className="input-row">
          <button 
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05L12.25 20.24C10.73 21.76 8.23 21.76 6.71 20.24C5.19 18.72 5.19 16.22 6.71 14.7L14.31 7.1C15.07 6.34 16.31 6.34 17.07 7.1C17.83 7.86 17.83 9.1 17.07 9.86L10.75 16.18C10.36 16.57 9.73 16.57 9.34 16.18C8.95 15.79 8.95 15.16 9.34 14.77L14.89 9.22L13.48 7.81L7.93 13.36C6.76 14.53 6.76 16.42 7.93 17.59C9.1 18.76 10.99 18.76 12.16 17.59L18.48 11.27C19.84 9.91 19.84 7.65 18.48 6.29C17.12 4.93 14.86 4.93 13.5 6.29L5.9 13.89C3.96 15.83 3.96 19.11 5.9 21.05C7.84 22.99 11.12 22.99 13.06 21.05L22.25 11.86L21.44 11.05Z" fill="currentColor"/>
            </svg>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe tu proyecto y qué tipo de inversores buscas..."
            disabled={isLoading}
          />
          
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="send-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;