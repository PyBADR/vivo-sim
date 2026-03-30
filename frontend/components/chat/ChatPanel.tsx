'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Send, Bot, ChevronRight } from 'lucide-react'

/* ── Bilingual copy ── */
const panelCopy = {
  analyst:         { en: 'Analyst',                    ar: 'المحلل' },
  query:           { en: 'Query',                      ar: 'استعلام' },
  suggestedQueries:{ en: 'Suggested queries',          ar: 'استعلامات مقترحة' },
  analysis:        { en: 'Analysis',                   ar: 'تحليل' },
  processing:      { en: 'Processing',                 ar: 'جاري المعالجة' },
  placeholder:     { en: 'Query the simulation...',    ar: 'استعلم عن المحاكاة...' },
}

const presetQueriesBI = [
  { en: 'Why did sentiment drop at t2?',               ar: 'لماذا انخفضت المشاعر في t2؟' },
  { en: 'Who influenced the spread most?',             ar: 'من أثّر على الانتشار أكثر؟' },
  { en: 'What if the government responds earlier?',    ar: 'ماذا لو استجابت الحكومة مبكرًا؟' },
]

const mockResponses: Record<string, { en: string; ar: string }> = {
  default: {
    en: 'Based on the simulation data, the primary driver was social media amplification by high-influence accounts. The negative sentiment spread rapidly through Twitter, peaking at t3 before government intervention at t4 began stabilizing public opinion.',
    ar: 'بناءً على بيانات المحاكاة، كان المحرك الرئيسي هو تضخيم وسائل التواصل الاجتماعي من قبل حسابات عالية التأثير. انتشرت المشاعر السلبية بسرعة عبر تويتر، وبلغت ذروتها في t3 قبل أن يبدأ التدخل الحكومي في t4 باستقرار الرأي العام.',
  },
  why: {
    en: 'The sentiment drop at t2 was triggered by influencer amplification. When high-influence accounts engaged with the topic, their reach multiplied the negative signal by approximately 3.2x, causing the hashtag to trend nationally.',
    ar: 'كان انخفاض المشاعر في t2 ناتجًا عن تضخيم المؤثرين. عندما تفاعلت الحسابات عالية التأثير مع الموضوع، تضاعف مدى الإشارة السلبية بنحو 3.2 مرة، مما تسبب في تصدر الهاشتاق على المستوى الوطني.',
  },
  who: {
    en: 'The top influencer in this simulation was @gcc_analyst with an influence score of 0.85, followed by @saudi_voice (0.75). Together, they accounted for roughly 40% of the amplification during the peak phase.',
    ar: 'كان المؤثر الأبرز في هذه المحاكاة هو @gcc_analyst بدرجة تأثير 0.85، يليه @saudi_voice (0.75). معًا، شكلا نحو 40% من التضخيم خلال مرحلة الذروة.',
  },
  'what if': {
    en: 'If the government had responded at t2 instead of t4, our model predicts the peak visibility would have been 35% lower and sentiment recovery would have occurred approximately 18 hours earlier, reducing the overall spread level from "high" to "medium".',
    ar: 'لو استجابت الحكومة في t2 بدلاً من t4، يتنبأ نموذجنا بأن ذروة الظهور كانت ستكون أقل بنسبة 35% وأن تعافي المشاعر كان سيحدث قبل نحو 18 ساعة، مما يخفض مستوى الانتشار الكلي من "عالي" إلى "متوسط".',
  },
}

function lc(pair: { en: string; ar: string }, lang: string): string {
  return lang === 'ar' ? pair.ar : pair.en
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  initialMessages?: Message[]
  scenarioId?: string
  lang?: string
}

export default function ChatPanel({ initialMessages = [], lang = 'en' }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAr = lang === 'ar'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (text?: string) => {
    const question = text || input
    if (!question.trim()) return

    const userMsg: Message = { id: `msg_${Date.now()}`, role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const lowerQ = question.toLowerCase()
      let responseKey = 'default'
      if (lowerQ.includes('why') || lowerQ.includes('drop') || lowerQ.includes('sentiment') || lowerQ.includes('لماذا') || lowerQ.includes('انخفض')) responseKey = 'why'
      else if (lowerQ.includes('who') || lowerQ.includes('influenc') || lowerQ.includes('من') || lowerQ.includes('أثّر')) responseKey = 'who'
      else if (lowerQ.includes('what if') || lowerQ.includes('earlier') || lowerQ.includes('government') || lowerQ.includes('ماذا لو') || lowerQ.includes('الحكومة')) responseKey = 'what if'

      const resp = mockResponses[responseKey]
      const assistantMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: lc(resp, lang),
      }
      setMessages(prev => [...prev, assistantMsg])
      setIsTyping(false)
    }, 1400)
  }

  return (
    <div className="bg-ds-surface rounded-ds-xl border border-ds-border overflow-hidden flex flex-col" style={{ maxHeight: '420px' }}>
      {/* Header — analyst interface */}
      <div className="ds-panel-header flex-shrink-0">
        <div className="ds-panel-header-title">
          <Terminal size={14} className="text-ds-accent" />
          <span className="text-caption font-semibold text-ds-text tracking-tight">{lc(panelCopy.analyst, lang)}</span>
        </div>
        <span className="text-nano font-mono text-ds-text-dim uppercase tracking-wider">{lc(panelCopy.query, lang)}</span>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="py-4">
            <p className="text-nano text-ds-text-dim uppercase tracking-wider font-semibold mb-3">{lc(panelCopy.suggestedQueries, lang)}</p>
            <div className="space-y-1.5">
              {presetQueriesBI.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(lc(q, lang))}
                  className={`w-full ${isAr ? 'text-right' : 'text-left'} px-3.5 py-2.5 text-micro text-ds-text-secondary bg-ds-card border border-ds-border rounded-ds-lg hover:bg-ds-card-hover hover:border-ds-border-hover transition-all duration-200 flex items-center gap-2 group`}
                >
                  <ChevronRight size={12} className={`text-ds-text-dim group-hover:text-ds-accent transition-colors flex-shrink-0 ${isAr ? 'rotate-180' : ''}`} />
                  <span>{lc(q, lang)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? (isAr ? 'justify-start' : 'justify-end') : (isAr ? 'justify-end' : 'justify-start')}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-ds-accent/12 border border-ds-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={11} className="text-ds-accent" />
              </div>
            )}
            <div className={`max-w-[85%] px-3.5 py-2.5 text-caption leading-relaxed ${
              msg.role === 'user'
                ? 'bg-ds-accent/10 text-ds-text border border-ds-accent/15 rounded-ds-lg rounded-br-md'
                : 'bg-ds-card text-ds-text-secondary border border-ds-border rounded-ds-lg rounded-bl-md'
            }`}>
              {msg.role === 'assistant' && (
                <span className="text-[9px] font-mono text-ds-accent/60 uppercase tracking-wider block mb-1">{lc(panelCopy.analysis, lang)}</span>
              )}
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-md bg-ds-accent/12 border border-ds-accent/20 flex items-center justify-center">
              <Bot size={11} className="text-ds-accent" />
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-ds-card border border-ds-border rounded-ds-lg rounded-bl-md">
              <span className="text-[9px] font-mono text-ds-accent/60 uppercase tracking-wider mr-1">{lc(panelCopy.processing, lang)}</span>
              <span className="w-1 h-1 rounded-full bg-ds-accent/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-ds-accent/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-ds-accent/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input — system console style */}
      <div className="border-t border-ds-border p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-accent/40 text-micro font-mono">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lc(panelCopy.placeholder, lang)}
              dir="auto"
              className="w-full bg-ds-card border border-ds-border rounded-ds-lg pl-7 pr-3.5 py-2.5 text-caption text-ds-text placeholder:text-ds-text-dim outline-none transition-all duration-200 focus:border-ds-accent/30 focus:shadow-[0_0_0_3px_rgba(91,123,248,0.06)] font-mono"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 bg-ds-accent/12 text-ds-accent rounded-ds-lg border border-ds-accent/15 hover:bg-ds-accent/20 hover:border-ds-accent/25 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
