import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ContentSidebar = ({ project, onChatSelect, investors, employees, user }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [chats, setChats] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (project) {
      loadChats();
      loadTemplates();
      loadFavorites();
    }
  }, [project]);

  const loadChats = async () => {
    const { data } = await supabase
      .table('chats')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });
    
    if (data) setChats(data);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .table('templates')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });
    
    if (data) setTemplates(data);
  };

  const loadFavorites = async () => {
    const { data } = await supabase
      .table('user_item_preferences')
      .select('*')
      .eq('project_id', project.id)
      .eq('user_id', user?.id);
    
    if (data) setFavorites(data);
  };

  return (
    <div className="content-sidebar">
      <div className="sidebar-tabs">
        <button 
          className={activeTab === 'chats' ? 'active' : ''} 
          onClick={() => setActiveTab('chats')}
        >
          💬 Chats
        </button>
        <button 
          className={activeTab === 'investors' ? 'active' : ''} 
          onClick={() => setActiveTab('investors')}
        >
          🏢 Inversores
        </button>
        <button 
          className={activeTab === 'employees' ? 'active' : ''} 
          onClick={() => setActiveTab('employees')}
        >
          👥 Empleados
        </button>
        <button 
          className={activeTab === 'templates' ? 'active' : ''} 
          onClick={() => setActiveTab('templates')}
        >
          📝 Plantillas
        </button>
        <button 
          className={activeTab === 'favorites' ? 'active' : ''} 
          onClick={() => setActiveTab('favorites')}
        >
          ⭐ Favoritos
        </button>
      </div>
      
      <div className="sidebar-content">
        {activeTab === 'chats' && (
          <div className="chat-list">
            {chats.map(chat => (
              <div key={chat.id} className="chat-item" onClick={() => onChatSelect(chat)}>
                <span className="chat-title">{chat.title}</span>
                <span className="chat-date">{new Date(chat.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'investors' && (
          <div className="investor-list">
            <div className="list-header">
              <h3>Inversores encontrados: {investors.length}</h3>
            </div>
            {investors.slice(0, 10).map((investor, idx) => (
              <div key={idx} className="investor-item">
                <h4>{investor.Company_Name}</h4>
                <p className="score">Score: {investor.Final_Score}</p>
                <p className="location">📍 {investor.Company_Location}</p>
              </div>
            ))}
            {investors.length > 10 && (
              <button className="load-more">Ver más ({investors.length - 10} más)</button>
            )}
          </div>
        )}
        
        {activeTab === 'employees' && (
          <div className="employee-list">
            <div className="list-header">
              <h3>Empleados encontrados: {employees.length}</h3>
            </div>
            {employees.slice(0, 10).map((employee, idx) => (
              <div key={idx} className="employee-item">
                <h4>{employee.name}</h4>
                <p className="company">{employee.company_name}</p>
                <p className="role">{employee.role_or_title}</p>
              </div>
            ))}
            {employees.length > 10 && (
              <button className="load-more">Ver más ({employees.length - 10} más)</button>
            )}
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div className="template-list">
            {!user ? (
              <div className="login-prompt">
                <p>Inicia sesión para generar plantillas personalizadas</p>
              </div>
            ) : (
              <>
                <button className="generate-template-btn">
                  Generar Nueva Plantilla
                </button>
                {templates.map(template => (
                  <div key={template.id} className="template-item">
                    <h4>{template.name}</h4>
                    <p className="template-type">{template.type}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'favorites' && (
          <div className="favorites-list">
            {favorites.filter(f => f.preference_type === 'favourite').map(fav => (
              <div key={fav.id} className="favorite-item">
                <span>⭐ {fav.item_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSidebar;