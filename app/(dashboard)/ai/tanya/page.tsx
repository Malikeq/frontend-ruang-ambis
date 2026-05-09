'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, latihanApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { cn, getMapelColor } from '@/lib/utils';
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] mt-0.5">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'rounded-br-sm bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white'
          : 'rounded-bl-sm border border-[rgba(255,255,255,0.07)] bg-[#1a1a35] text-[#e2e8f0]',
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className={cn('mt-1.5 text-[10px]', isUser ? 'text-[rgba(255,255,255,0.6)]' : 'text-[#475569]')}>
          {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] mt-0.5">
          <User className="h-4 w-4 text-[#94a3b8]" />
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[rgba(255,255,255,0.07)] bg-[#1a1a35] px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-2 w-2 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-2 w-2 rounded-full bg-[#6366f1] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function AiTanyaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Aku AI Lolos PTN, siap membantumu belajar SNBT 🎯\n\nKamu bisa tanya apa saja tentang:\n• Konsep dan materi SNBT\n• Strategi mengerjakan soal\n• Tips belajar efektif\n• Pembahasan soal yang kamu tidak mengerti\n\nApa yang ingin kamu tanyakan?',
      timestamp: new Date(),
    }
  ]);
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
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: jawaban,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Gagal menghubungi AI. Coba lagi.';
      toast.error(msg);
      setIsTyping(false);
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== 'pending'));
    },
  });

  function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    tanyaMut.mutate(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClear() {
    setMessages(prev => [prev[0]]); // keep only welcome message
    toast.info('Percakapan dibersihkan');
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6366f1]" /> Tanya AI
          </h1>
          <p className="text-sm text-[#64748b]">Asisten belajar SNBT personal berbasis AI</p>
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
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] p-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Starter questions (show when only welcome message) */}
      {messages.length === 1 && (
        <div className="mt-3 grid grid-cols-2 gap-2 shrink-0">
          {STARTER_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)] px-3 py-2.5 text-left text-xs text-[#94a3b8] hover:border-[rgba(99,102,241,0.4)] hover:text-[#f1f5f9] transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 shrink-0">
        <div className="flex gap-2 items-end rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141428] p-3 focus-within:border-[rgba(99,102,241,0.4)] transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Tanya apa saja tentang SNBT... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[#f1f5f9] placeholder-[#475569] outline-none leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <Button
            variant="gradient"
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            isLoading={isTyping}
            className="shrink-0 h-9 w-9 !p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-[#334155]">
          AI dapat membuat kesalahan. Verifikasi informasi penting sebelum dijadikan patokan belajar.
        </p>
      </div>
    </div>
  );
}
