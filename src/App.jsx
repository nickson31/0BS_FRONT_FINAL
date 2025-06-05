import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { sendGuestChatMessage } from './services/apiService';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
      type: 'chat_message'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUserInput('');

    try {
      const apiResponse = await sendGuestChatMessage(userInput);
      
      const geminiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: apiResponse.type === 'investor_results' ? apiResponse.follow_up_message : apiResponse.data,
        type: apiResponse.type || 'chat_message'
      };

      if (apiResponse.type === 'investor_results' && apiResponse.data) {
        geminiMessage.investors = apiResponse.data;
      }

      setMessages(prev => [...prev, geminiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'gemini',
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm px-4 py-2 flex justify-between items-center z-10">
        <h1 className="text-lg font-semibold">0BULLSHIT</h1>
        <Link to="/login" className="text-blue-500 hover:text-blue-600">
          Iniciar Sesión
        </Link>
      </div>

      {/* Messages Area */}
      <div className="pt-14 pb-20 px-4 max-w-3xl mx-auto">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-sm'
                }`}
              >
                <p>{message.text}</p>
                {message.type === 'investor_results' && message.investors && (
                  <ul className="mt-2 space-y-1">
                    {message.investors.map((investor, index) => (
                      <li key={index} className="text-sm">
                        {investor.company_name} - Score: {investor.Final_Score}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed bottom-20 left-0 right-0 text-center text-gray-600">
          Gemini está pensando...
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Chatea para encontrar inversores..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
        </button>
        </div>
      </div>
    </div>
  );
}

export default App;
