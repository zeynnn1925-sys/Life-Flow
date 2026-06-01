import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Check, 
  CornerDownLeft, 
  Info, 
  Sparkles,
  PhoneCall, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  User,
  Zap,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export default function ChatBotSimulator() {
  const { language } = useLanguage();
  const { categories, saveTransaction } = useData();
  const { user } = useAuth();
  const isId = language === 'id';

  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: isId 
        ? "Halo! Saya adalah Bot LifeFlow AI. 🤖\n\nKirim pesan teks biasa untuk mencatat pengeluaran atau pendapatan Anda secara instan tanpa perlu masuk ke formulir. \n\nCobalah ketik sesuatu seperti:\n• *'Makan siang bakso 25rb'*\n• *'Gaji bulanan masuk 10jt'*\n• *'Beli bensin pertalite 50.000'*" 
        : "Hello! I am your LifeFlow AI Assistant Bot. 🤖\n\nSimply send plain text to log your expenses or income instantly without opening forms. \n\nTry writing things like:\n• *'Lunch meatball 25k'*\n• *'Salary bonus 5000000'*\n• *'Venti ice coffee 45k'*",
      timestamp: '08:00',
      status: 'read'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Clickable templates for instant tasting
  const templates = isId ? [
    { label: "Makan bakso 25rb", text: "Makan siang bakso 25rb" },
    { label: "Gaji masuk 5jt", text: "Gaji masuk bulanan 5.000.000" },
    { label: "Beli bensin 50rb", text: "Isi bensin pertamax 50rb" },
    { label: "Nonton bioskop 75k", text: "Nonton bioskop 75rb" }
  ] : [
    { label: "Meatball lunch 25k", text: "Lunch meatball 25k" },
    { label: "Monthly Salary 5jt", text: "Monthly salary entry 5,000,000" },
    { label: "Petrol fuel 50k", text: "Petrol fuel 50k" },
    { label: "Cinema tickets 75k", text: "Cinema ticket purchase 75k" }
  ];

  const parseTransactionText = (text: string) => {
    const cleanText = text.toLowerCase().trim();

    // 1. Try to find number in text
    // Handles formats like 25rb, 25k, 5jt, 5m, 120.000, 100,000, 50k
    let amount = 0;
    
    // Regex looking for numbers possibly with decimals followed by multipliers
    const amountRegex = /(\d+[\d.,]*)\s*(rb|ribu|k|jt|juta|m|mio|mil|j)?/i;
    const match = cleanText.match(amountRegex);
    
    if (match) {
      let rawNum = match[1].replace(/[,.]/g, ''); // strip thousand separators
      let num = parseFloat(rawNum);
      const multiplier = match[2];

      if (multiplier) {
        const m = multiplier.toLowerCase();
        if (m === 'rb' || m === 'ribu' || m === 'k') {
          num *= 1000;
        } else if (m === 'jt' || m === 'juta') {
          num *= 1000000;
        } else if (m === 'm' || m === 'mio') {
          num *= 1000000;
        }
      }
      amount = num;
    }

    // 2. Determine description
    // Strip the recognized amount and keywords from the message to make a clean title
    let desc = text;
    if (match) {
      desc = text.replace(match[0], '').trim();
    }
    // Strip trailing or leading connecting words in Indonesian/English
    desc = desc.replace(/^(beli|isi|bayar|masuk|buat|untuk)\s+/gi, '')
              .replace(/\s+(sebesar|sebanyak|nominal)\s*$/gi, '')
              .trim();

    if (!desc) {
      desc = isId ? "Belanja Lain-lain" : "Other Expense";
    }

    // Capitalize first letter
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);

    // 3. Match category mapping
    let matchedCategoryId = '';
    const categoriesList = categories;

    const lowerDesc = desc.toLowerCase();
    
    // Default categories categories matching
    if (lowerDesc.includes('makan') || lowerDesc.includes('bakso') || lowerDesc.includes('kuliner') || lowerDesc.includes('kopi') || lowerDesc.includes('lunch') || lowerDesc.includes('breakfast') || lowerDesc.includes('dinner') || lowerDesc.includes('food') || lowerDesc.includes('coffee') || lowerDesc.includes('starbucks')) {
      matchedCategoryId = categoriesList.find(c => c.name.toLowerCase().includes('food') || c.id === 'e3')?.id || '';
    } else if (lowerDesc.includes('bensin') || lowerDesc.includes('gojek') || lowerDesc.includes('grab') || lowerDesc.includes('transport') || lowerDesc.includes('petrol') || lowerDesc.includes('car') || lowerDesc.includes('motor') || lowerDesc.includes('taxi')) {
      matchedCategoryId = categoriesList.find(c => c.name.toLowerCase().includes('transport') || c.id === 'e4')?.id || '';
    } else if (lowerDesc.includes('gaji') || lowerDesc.includes('salary') || lowerDesc.includes('income') || lowerDesc.includes('bonus') || lowerDesc.includes('royalti')) {
      matchedCategoryId = categoriesList.find(c => c.type === 'income')?.id || 'i1';
    } else if (lowerDesc.includes('listrik') || lowerDesc.includes('air') || lowerDesc.includes('wifi') || lowerDesc.includes('internet') || lowerDesc.includes('pulsa') || lowerDesc.includes('utilities') || lowerDesc.includes('zap') || lowerDesc.includes('token')) {
      matchedCategoryId = categoriesList.find(c => c.name.toLowerCase().includes('utilities') || c.id === 'e2')?.id || '';
    } else if (lowerDesc.includes('bioskop') || lowerDesc.includes('film') || lowerDesc.includes('nonton') || lowerDesc.includes('youtube') || lowerDesc.includes('spotify') || lowerDesc.includes('game') || lowerDesc.includes('netflix') || lowerDesc.includes('cinema') || lowerDesc.includes('entertainment')) {
      matchedCategoryId = categoriesList.find(c => c.name.toLowerCase().includes('entertainment') || c.id === 'e6')?.id || '';
    } else if (lowerDesc.includes('dokter') || lowerDesc.includes('sakit') || lowerDesc.includes('obat') || lowerDesc.includes('apotek') || lowerDesc.includes('health') || lowerDesc.includes('klinik')) {
      matchedCategoryId = categoriesList.find(c => c.name.toLowerCase().includes('health') || c.id === 'e5')?.id || '';
    } else if (lowerDesc.includes('kos') || lowerDesc.includes('kontrakan') || lowerDesc.includes('sewa') || lowerDesc.includes('housing') || lowerDesc.includes('rent') || lowerDesc.includes('apartment')) {
      matchedCategoryId = categoriesList.find(c => c.name.toLowerCase().includes('housing') || c.id === 'e1')?.id || '';
    }

    // Fallback Expense Category if empty
    if (!matchedCategoryId) {
      matchedCategoryId = categoriesList.find(c => c.type === 'expense' && (c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('personal care') || c.id === 'e8'))?.id || categoriesList[0]?.id || '';
    }

    // 4. Decide transaction type
    let type: 'income' | 'expense' = 'expense';
    if (lowerDesc.includes('gaji') || lowerDesc.includes('masuk') || lowerDesc.includes('income') || lowerDesc.includes('salary') || lowerDesc.includes('bonus') || lowerDesc.includes('jp') || lowerDesc.includes('untung')) {
      type = 'income';
    }

    return {
      description: desc,
      amount,
      type,
      category: matchedCategoryId
    };
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = crypto.randomUUID();

    // Adding user message
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: timeString,
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Update message status to delivered then read
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, status: 'delivered' } : m));
    }, 400);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, status: 'read' } : m));
    }, 800);

    // Parse and save transaction using real-time data flow!
    setTimeout(async () => {
      const parsed = parseTransactionText(text);

      if (parsed.amount > 0) {
        // Save to actual database / context!
        const transactionObj: Transaction = {
          id: crypto.randomUUID(),
          description: parsed.description,
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category,
          date: new Date().toISOString(),
          notes: isId ? `Dicatat otomatis via Bot Simulator (${platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'})` : `Recorded automatically via Bot Simulator (${platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'})`
        };

        await saveTransaction(transactionObj);

        const categoryObj = categories.find(c => c.id === parsed.category);
        const categoryName = categoryObj ? categoryObj.name : 'Other';

        const replyText = isId 
          ? `✅ *Transaksi Berhasil Dicatat!*\n\n• *Deskripsi:* ${parsed.description}\n• *Jumlah:* Rp ${parsed.amount.toLocaleString('id-ID')}\n• *Kategori:* ${categoryName}\n• *Tipe:* ${parsed.type === 'income' ? '🟢 Pendapatan' : '🔴 Pengeluaran'}\n\n_Data ini telah disinkronkan ke pembukuan utama LifeFlow secara real-time!_`
          : `✅ *Transaction Recorded Successfully!*\n\n• *Description:* ${parsed.description}\n• *Amount:* Rp ${parsed.amount.toLocaleString()}\n• *Category:* ${categoryName}\n• *Type:* ${parsed.type === 'income' ? '🟢 Income' : '🔴 Expense'}\n\n_This data is now synced to your primary LifeFlow logs in real-time!_`;

        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        const replyTextFailure = isId 
          ? `❌ *Gagal Mendeteksi Nominal!*\n\nFormat pesan tidak dikenali. Pastikan Anda menulis deskripsi diikuti nominal angka.\n\nContoh: *'Beli kopi starbucks 40.000'* atau *'gaji 20000k'*`
          : `❌ *Could Not Recognize Amount!*\n\nSorry, I couldn't parse the transaction value. Please write a description followed by the numeric amount.\n\nExample: *'Lunch burger 35000'* or *'Coffee cup 45k'*`;

        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: replyTextFailure,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
      setIsTyping(false);
    }, 1500);
  };

  const cleanAllLogs = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'bot',
        text: isId 
          ? "Riwayat percakapan dibersihkan. Bot siap melayani Anda. Silakan masukkan catatan pengeluaran!" 
          : "Conversation history cleared. Bot is ready. Send your transaction notes now!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Top Messenger Bar */}
      <div className={`p-3 flex items-center justify-between z-10 shrink-0 ${
        platform === 'whatsapp' ? 'bg-[#075e54]' : 'bg-[#229ed9]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white relative">
            <User size={18} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#075e54] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-white text-xs tracking-wide">
              {platform === 'whatsapp' ? 'LifeFlow Business Bot' : 'LifeFlow Bot Assistant'}
              <span className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded font-semibold">AI</span>
            </div>
            <p className="text-[10px] text-white/80">online</p>
          </div>
        </div>

        {/* Action icons / toggle platform */}
        <div className="flex items-center gap-4 text-white">
          <button 
            onClick={() => setPlatform(platform === 'whatsapp' ? 'telegram' : 'whatsapp')}
            className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-all font-bold font-mono cursor-pointer"
          >
            SWITCH TO {platform === 'whatsapp' ? 'TELEGRAM' : 'WHATSAPP'}
          </button>
          <button 
            onClick={cleanAllLogs}
            className="text-white/70 hover:text-white transition-all text-xs border border-white/20 px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
            title="Clean"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Canvas Container with specific styled backgrounds */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-[#0e1118] relative" style={{
        backgroundImage: platform === 'whatsapp' 
          ? 'radial-gradient(#121a24 0.5px, transparent 0.5px), radial-gradient(#121a24 0.5px, #0b0e14 0.5px)' 
          : 'linear-gradient(to bottom, #0f172a, #020617)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}>
        {messages.map(msg => {
          const isMe = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-md leading-relaxed ${
                isMe 
                  ? 'bg-violet-600 text-white rounded-tr-none' 
                  : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none font-sans'
              }`}>
                {/* Parse Markdown highlights within text manually */}
                <div className="whitespace-pre-wrap">
                  {msg.text.split('\n').map((line, linIdx) => {
                    return (
                      <div key={linIdx} className="mb-0.5">
                        {line.split(' ').map((word, wordIdx) => {
                          if (word.startsWith('*') && word.endsWith('*')) {
                            return <strong key={wordIdx} className="text-violet-300 font-bold">{word.slice(1, -1)} </strong>;
                          }
                          return word + ' ';
                        })}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 mt-1 font-mono">
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'sent' && '✓'}
                      {msg.status === 'delivered' && '✓✓'}
                      {msg.status === 'read' && <span className="text-emerald-400">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Simulated Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-white/5 rounded-xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Templates */}
      <div className="p-2 border-t border-white/5 bg-[#0b0d13] shrink-0 overflow-x-auto flex gap-1.5 items-center scrollbar-hide z-10 select-none">
        <span className="text-[9px] text-slate-500 font-semibold font-mono uppercase shrink-0 px-1 ml-1 flex items-center gap-1">
          <Zap size={10} className="text-yellow-400" />
          Click to log:
        </span>
        {templates.map((tpl, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(tpl.text)}
            disabled={isTyping}
            className="text-[11px] bg-slate-900 border border-white/5 hover:border-violet-500/35 hover:bg-violet-950/20 text-slate-300 font-medium px-2.5 py-1 rounded-full transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Message bar console input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-[#11141d] border-t border-white/5 flex gap-2 items-center shrink-0 z-10"
      >
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          placeholder={isId ? "Ketik pesan transaksi... misal: makan siang 25k" : "Type a note... e.g. sushi feast 150k"}
          className="bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none flex-1 focus:border-violet-500 transition-all font-sans"
        />
        <button 
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
