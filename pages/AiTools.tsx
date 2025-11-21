import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Image as ImageIcon, MessageSquare, Loader2, Download, ListTodo, CheckSquare, Square, Trash2 } from 'lucide-react';
import { createChatSession, generateImage } from '../services/geminiService';
import { ChatMessage, GeneratedImage } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useThemeStore } from '../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';

const AiTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const { t } = useThemeStore();

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 font-medium flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare size={18} />
          <span>{t('AI Assistant')}</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`pb-3 px-4 font-medium flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'image' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon size={18} />
          <span>{t('Image Studio')}</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
                <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    <ChatInterface />
                </motion.div>
            ) : (
                <motion.div 
                    key="image"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    <ImageGenerator />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const { t } = useThemeStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: t('Model Welcome'), timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Task Store
  const { tasks, addTask, toggleTask, deleteTask } = useTaskStore();

  // Derived state for filtering
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'pending') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;

  useEffect(() => {
    const initChat = async () => {
      try {
        chatSessionRef.current = await createChatSession();
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Intercept Task Commands
    const taskMatch = currentInput.match(/^(?:remind me to|add task|create task)\s+(.+)/i);
    if (taskMatch) {
        const taskText = taskMatch[1].trim();
        // Simulate AI processing time
        setTimeout(() => {
            addTask(taskText);
            const modelMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'model', 
                text: t('Task Added'), 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, modelMsg]);
            setIsLoading(false);
        }, 600);
        return;
    }

    if (!chatSessionRef.current) {
        setIsLoading(false);
        return;
    }

    try {
      const result = await chatSessionRef.current.sendMessage({ message: currentInput });
      const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: result.text, timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: t('Error Error'), timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
                 <Loader2 className="animate-spin text-slate-400" size={16} />
                 <span className="text-sm text-slate-500 dark:text-slate-300">{t('Generating')}</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('Ask placeholder')}
              className="flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Task Sidebar */}
      <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-700 flex flex-col h-[40vh] md:h-auto border-t md:border-t-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between bg-white dark:bg-slate-800 md:bg-transparent">
            <div className="flex items-center">
                <ListTodo className="mr-2 text-primary" size={20}/> {t('Tasks')}
            </div>
            <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                {pendingCount}
            </span>
        </div>

        {/* Filter Controls */}
        <div className="px-4 py-2 flex space-x-1 border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
            {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`flex-1 text-xs py-1.5 rounded-md capitalize transition-all ${
                        taskFilter === f
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
                {filteredTasks.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 mt-10 px-4">
                        <ListTodo size={40} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">
                            {taskFilter === 'all' ? t('Task Empty') : `No ${taskFilter} tasks`}
                        </p>
                    </motion.div>
                )}
                {filteredTasks.map(task => (
                    <motion.div 
                        key={task.id}
                        layout
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-primary/30 transition-colors overflow-hidden"
                    >
                        <div className="flex items-start space-x-3">
                            <button 
                                onClick={() => toggleTask(task.id)} 
                                className={`mt-0.5 transition-colors ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-primary'}`}
                            >
                                {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                            <span className={`text-sm flex-1 break-words ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {task.text}
                            </span>
                            <button 
                                onClick={() => deleteTask(task.id)} 
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useThemeStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt, size);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please check your API Key permissions.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full md:flex-row">
      {/* Controls */}
      <div className="w-full md:w-1/3 p-6 border-r border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-6 overflow-y-auto">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{t('Image Prompt')}</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('Describe image')}
            className="w-full h-32 p-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{t('Resolution')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {['1K', '2K', '4K'].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s as any)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  size === s
                    ? 'bg-white dark:bg-slate-700 border-primary text-primary dark:text-blue-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
          <p><strong>Note:</strong> {t('Note Quality')}</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          <span>{isGenerating ? t('Generating') : t('Generate Image')}</span>
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-900 flex items-center justify-center min-h-[400px]">
        {generatedImage ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-full max-h-full">
            <img src={generatedImage} alt="Generated" className="rounded-xl shadow-lg max-h-[70vh] object-contain" />
            <a
                href={generatedImage}
                download={`smartpos-gen-${Date.now()}.png`}
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Download size={20} />
            </a>
          </motion.div>
        ) : (
          <div className="text-center text-slate-400">
            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>Your generated image will appear here.</p>
            {error && <p className="text-red-500 mt-4 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiTools;