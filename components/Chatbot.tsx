import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, RefreshCw, History as HistoryIcon, ArrowLeft } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { API_URL, GEMINI_API_KEY } from '../constants';

// Define explicit interface for Content locally to avoid import issues
interface Content {
  role: string;
  parts: { text?: string; functionCall?: any; functionResponse?: any }[];
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  
  // Current active session messages
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  
  // Historical messages from backend
  const [historyLogs, setHistoryLogs] = useState<{ sender: 'user' | 'bot'; text: string; timestamp?: string }[]>([]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
        // Fetch context (financial data) for the prompt
        fetch(`${API_URL}/chatbot/context?user_id=${user.id}`)
            .then(res => res.json())
            .then(setContext)
            .catch(err => console.error("Context fetch failed:", err));

        // Initialize with greeting if empty
        if (messages.length === 0) {
            setMessages([{ sender: 'bot', text: 'Hi! I am CashBuddy, your AI financial advisor. Ask me about your budget, debts, or savings!' }]);
        }
    }
  }, [isOpen, user]);

  useEffect(() => {
      if (view === 'history' && isOpen && user?.id) {
          fetchHistory();
      }
  }, [view, isOpen, user]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
        const res = await fetch(`${API_URL}/chatbot/history?user_id=${user.id}`);
        const data = await res.json();
        // Map backend history to UI format
        const formatted = data.map((msg: any) => ({
            sender: msg.role === 'model' ? 'bot' : msg.role, 
            text: msg.content,
            timestamp: msg.timestamp
        }));
        setHistoryLogs(formatted);
    } catch (e) {
        console.error("Failed to load chat history");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (view === 'history') {
        historyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [historyLogs, view]);

  const resetChat = () => {
      setMessages([{ sender: 'bot', text: 'Hi! I am CashBuddy. Starting a new session for you.' }]);
      setView('chat');
  };

  const logMessage = async (role: 'user' | 'bot', content: string) => {
      if (!user?.id) return;
      try {
        await fetch(`${API_URL}/chatbot/log?user_id=${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, content })
        });
      } catch (e) {
          console.error("Failed to log message", e);
      }
  };

  // --- Tool Definitions ---
  const toolDefinitions = [
    {
      functionDeclarations: [
        {
          name: "add_transaction",
          description: "Add a new financial transaction (expense or income).",
          parameters: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Description of the transaction" },
              amount: { type: Type.NUMBER, description: "Amount of money" },
              type: { type: Type.STRING, description: "Type: 'Income' or 'Expense'" },
              category: { type: Type.STRING, description: "Category from: Food, Travel, Shopping, Entertainment, Utilities, Housing, Health, Education, Other" },
            },
            required: ["description", "amount", "type", "category"]
          }
        },
        {
          name: "add_debt",
          description: "Add a debt record for a friend (Friend Ledger).",
          parameters: {
            type: Type.OBJECT,
            properties: {
               friend_name: { type: Type.STRING, description: "Name of the friend" },
               amount: { type: Type.NUMBER, description: "Amount involved" },
               type: { type: Type.STRING, description: "'FRIEND_OWES_ME' (if you lent money) or 'I_OWE_FRIEND' (if you borrowed)" },
               description: { type: Type.STRING, description: "Optional note about the debt" }
            },
            required: ["friend_name", "amount", "type"]
          }
        },
        {
          name: "add_savings_goal",
          description: "Create a new savings goal.",
          parameters: {
              type: Type.OBJECT,
              properties: {
                  name: { type: Type.STRING, description: "Name of the goal (e.g. New Car)" },
                  target_amount: { type: Type.NUMBER, description: "Target amount to save" }
              },
              required: ["name", "target_amount"]
          }
        }
      ]
    }
  ];

  // --- Tool Execution Logic ---
  const executeFunction = async (name: string, args: any) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log(`Executing tool: ${name} with args:`, args);

      if (name === 'add_transaction') {
          const payload = {
              description: args.description,
              amount: args.amount,
              type: args.type,
              category: args.category,
              date: new Date().toISOString()
          };
          const res = await fetch(`${API_URL}/transactions?user_id=${user.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to add transaction");
          return { status: "success", message: "Transaction added." };
      }

      if (name === 'add_debt') {
          const payload = {
              friend_name: args.friend_name,
              amount: args.amount,
              type: args.type,
              description: args.description || "Added via AI",
              date: new Date().toISOString()
          };
          const res = await fetch(`${API_URL}/debts?user_id=${user.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to add debt record");
          return { status: "success", message: "Debt record added." };
      }

      if (name === 'add_savings_goal') {
          const payload = {
              user_id: user.id,
              name: args.name,
              target_amount: args.target_amount
          };
          const res = await fetch(`${API_URL}/savings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error("Failed to add savings goal");
          return { status: "success", message: "Savings goal created." };
      }

      return { error: "Unknown function" };
  };

  const handleSend = async () => {
    if (!input.trim() || !user?.id) return;
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("PASTE_YOUR_KEY")) {
        setMessages(prev => [...prev, { sender: 'bot', text: "Error: AI Service Key is missing. Please check configuration." }]);
        return;
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);
    logMessage('user', userMsg);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      // Filter out UI-only messages for the API context to avoid confusing the model
      const validHistory = messages.filter(m => 
        m.text &&
        m.text.trim() !== "" &&
        !m.text.startsWith("Error:") && 
        !m.text.startsWith("Sorry,") &&
        !m.text.includes("CashBuddy is thinking") &&
        m.text !== 'Hi! I am CashBuddy, your AI financial advisor. Ask me about your budget, debts, or savings!' &&
        m.text !== 'Hi! I am CashBuddy. Starting a new session for you.' &&
        !m.text.startsWith('_Processing')
      );

      const historyForGemini: Content[] = validHistory.map(m => ({
          role: m.sender === 'bot' ? 'model' : 'user',
          parts: [{ text: m.text }]
      }));

      const systemInstruction = `You are CashBuddy, a helpful financial assistant.
      
      Context:
      ${context ? JSON.stringify(context, null, 2) : "No financial data available yet."}
      
      Capabilities:
      - You can answer questions about the user's finances.
      - You can **ADD TRANSACTIONS**, **ADD DEBTS (Friend Ledger)**, and **CREATE SAVINGS GOALS** using the provided tools.
      - When asked to add something, gather the necessary info (like amount, category, friend name) and call the tool.
      
      Response Rules:
      - Use **bold** for amounts.
      - Be concise.
      - Format currency in INR (₹).
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: systemInstruction,
            tools: toolDefinitions
        },
        history: historyForGemini
      });

      // Send initial message
      let result = await chat.sendMessage({ message: userMsg });

      let responseText = "";
      
      // Check for function calls
      const functionCalls = result.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
          const toolResponses = [];
          
          for (const call of functionCalls) {
              setMessages(prev => [...prev, { sender: 'bot', text: `_Processing ${call.name}..._` }]);
              
              try {
                  const executionResult = await executeFunction(call.name, call.args);
                  toolResponses.push({
                      functionResponse: {
                          name: call.name,
                          response: { result: executionResult },
                          id: call.id
                      }
                  });
              } catch (e: any) {
                  toolResponses.push({
                      functionResponse: {
                          name: call.name,
                          response: { error: e.message },
                          id: call.id
                      }
                  });
              }
          }

          // Send tool execution results back to the model.
          // Correctly wrap toolResponses in the message object to avoid "ContentUnion is required" error.
          const finalResult = await chat.sendMessage({ message: toolResponses });
          
          if (finalResult.text) {
              responseText = finalResult.text;
          } else if (finalResult.candidates && finalResult.candidates[0]?.content?.parts) {
              responseText = finalResult.candidates[0].content.parts[0].text || "Done.";
          }
      } else {
          // Standard text response
          if (result.text) {
              responseText = result.text;
          } else if (result.candidates && result.candidates[0]?.content?.parts) {
              responseText = result.candidates[0].content.parts[0].text || "";
          }
      }

      if (!responseText) responseText = "I processed that but have nothing to say.";

      setMessages(prev => {
          const clean = prev.filter(m => !m.text.startsWith('_Processing'));
          return [...clean, { sender: 'bot', text: responseText }];
      });
      
      logMessage('bot', responseText);

      // Refresh context after potential updates
      fetch(`${API_URL}/chatbot/context?user_id=${user.id}`)
            .then(res => res.json())
            .then(setContext);

    } catch (e: any) {
      console.error("AI Error:", e);
      let errorMsg = "Sorry, I'm having trouble connecting right now.";
      if (e.message?.includes('API key')) errorMsg = "Error: Invalid Configuration.";
      setMessages(prev => [...prev, { sender: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  // Custom Markdown Parser
  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const processInline = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*|_.*?_)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
                return <span key={i} className="italic text-slate-500 dark:text-slate-400">{part.slice(1, -1)}</span>;
            }
            return part;
        });
    };

    lines.forEach((line, index) => {
        const key = `line-${index}`;
        const trimmed = line.trim();

        if (!trimmed.startsWith('- ') && !trimmed.startsWith('* ') && currentList.length > 0) {
            elements.push(<ul key={`list-${index}`} className="list-disc pl-5 mb-2 space-y-1 text-slate-700 dark:text-slate-300">{currentList}</ul>);
            currentList = [];
        }

        if (trimmed.startsWith('### ')) {
             elements.push(<h3 key={key} className="font-bold text-sm mb-1 mt-3 uppercase text-emerald-600 dark:text-emerald-400">{processInline(trimmed.replace('### ', ''))}</h3>);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             currentList.push(<li key={`li-${index}`}>{processInline(trimmed.substring(2))}</li>);
        } else if (trimmed !== '') {
             elements.push(<p key={key} className="mb-2 last:mb-0 leading-relaxed">{processInline(line)}</p>);
        }
    });

    if (currentList.length > 0) {
        elements.push(<ul key="list-end" className="list-disc pl-5 mb-2 space-y-1 text-slate-700 dark:text-slate-300">{currentList}</ul>);
    }

    return elements;
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex flex-col items-center"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-slate-800 w-96 h-[550px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 flex justify-between items-center shadow-md">
             <div className="flex items-center space-x-2">
               <Bot className="w-6 h-6 text-emerald-400" />
               <div>
                   <h3 className="font-semibold text-sm">CashBuddy AI</h3>
                   <span className="text-[10px] text-emerald-400 block">{view === 'chat' ? 'Online' : 'Archive'}</span>
               </div>
             </div>
             
             <div className="flex items-center space-x-1">
                 {view === 'chat' ? (
                    <>
                        <button onClick={() => setView('history')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title="View History">
                            <HistoryIcon className="w-4 h-4" />
                        </button>
                        <button onClick={resetChat} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors" title="Start New Chat">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </>
                 ) : (
                    <button onClick={() => setView('chat')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center space-x-1 text-xs">
                        <ArrowLeft className="w-3 h-3" /> <span>Back</span>
                    </button>
                 )}
                 <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors ml-1">
                   <X className="w-5 h-5" />
                 </button>
             </div>
          </div>

          {/* Active Chat View */}
          {view === 'chat' ? (
             <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                    {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        msg.sender === 'user' 
                            ? 'bg-emerald-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-bl-none shadow-sm'
                        }`}>
                        {renderMessageContent(msg.text)}
                        </div>
                    </div>
                    ))}
                    {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-lg rounded-bl-none animate-pulse text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                        <Bot size={12} /> <span>CashBuddy is thinking...</span>
                        </div>
                    </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center space-x-2">
                    <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask to add expense or advice..."
                    disabled={loading}
                    className="flex-1 p-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="p-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                    >
                    <Send className="w-4 h-4" />
                    </button>
                </div>
             </>
          ) : (
             /* History View */
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-950">
                 {historyLogs.length === 0 ? (
                     <div className="text-center text-slate-400 mt-20">No history found.</div>
                 ) : (
                     historyLogs.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-400 mb-1 px-1">
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                            </span>
                            <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' 
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                                {renderMessageContent(msg.text)}
                            </div>
                        </div>
                     ))
                 )}
                 <div ref={historyRef} />
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;