'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Send, Sparkles, User, Bot, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STARTER_QUESTIONS = [
  'Jelaskan konsep Penalaran Umum di SNBT',
  'Bagaimana strategi mengerjakan soal Literasi Bahasa Indonesia?',
  'Tips menghadapi soal Penalaran Matematika level sulit?',
  'Apa perbedaan antara SNBT dan SBMPTN?',
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={isUser
          ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', borderBottomRightRadius: '0.25rem' }
          : { border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderBottomLeftRadius: '0.25rem' }
        }
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className="mt-1.5 text-[10px]" style={{ opacity: 0.6 }}>
          {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5"
          style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <User className="h-4 w-4 t-secondary" />
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }} />
        <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }} />
        <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function AiTanyaPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'assistant',
    content: 'Halo! Aku AI Lolos PTN, siap membantumu belajar SNBT 🎯\n\nKamu bisa tanya apa saja tentang:\n• Konsep dan materi SNBT\n• Strategi mengerjakan soal\n• Tips belajar efektif\n• Pembahasan soal yang kamu tidak mengerti\n\nApa yang ingin kamu tanyakan?',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const tanyaMut = useMutation({
    mutationFn: (pertanyaan: string) => aiApi.tanya({ pertanyaan, context: 'general' }),
    onSuccess: (res) => {
      const jawaban = res.data?.data?.jawaban ?? res.data?.data?.answer ?? 'Maaf, tidak dapat memproses pertanyaanmu saat ini.';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: jawaban, timestamp: new Date() }]);
      setIsTyping(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Gagal menghubungi AI. Coba lagi.');
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m.id !== 'pending'));
    },
  });

  function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || isTyping) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() }]);
    setInput('');
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    tanyaMut.mutate(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleClear() {
    setMessages(prev => [prev[0]]);
    toast.info('Percakapan dibersihkan');
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold t-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: 'var(--primary)' }} /> Tanya AI
          </h1>
          <p className="text-sm t-muted">Asisten belajar SNBT personal berbasis AI</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/latihan">
            <Button variant="secondary" size="sm">
              <BookOpen className="h-4 w-4" /> Latihan Soal
            </Button>
          </Link>
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Starter questions */}
      {messages.length === 1 && (
        <div className="mt-3 grid grid-cols-2 gap-2 shrink-0">
          {STARTER_QUESTIONS.map(q => (
            <button key={q} onClick={() => handleSend(q)}
              className="rounded-xl px-3 py-2.5 text-left text-xs t-secondary transition-all"
              style={{ border: '1px solid var(--primary-border)', backgroundColor: 'var(--primary-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary-muted)')}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 shrink-0">
        <div className="flex gap-2 items-end rounded-2xl p-3 transition-colors"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Tanya apa saja tentang SNBT... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm t-primary outline-none leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <Button variant="gradient" size="sm" onClick={() => handleSend()}
            disabled={!input.trim() || isTyping} isLoading={isTyping}
            className="shrink-0 h-9 w-9 !p-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] t-muted">
          AI dapat membuat kesalahan. Verifikasi informasi penting sebelum dijadikan patokan belajar.
        </p>
      </div>
    </div>
  );
}
