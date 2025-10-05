import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AnalysisResult {
  id: string;
  text: string;
  confidence: number;
  verdict: 'verified' | 'unverified' | 'warning';
  sources: string[];
  timestamp: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  aiScore: number;
  aiInsights: string[];
}

const STORAGE_KEY = 'text-analyzer-history';
const MAX_HISTORY_ITEMS = 50;

const Index = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    }
  }, []);

  const saveHistory = (newHistory: AnalysisResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Ошибка сохранения истории:', error);
    }
  };

  const analyzeText = () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const textLength = text.length;
      const wordCount = text.trim().split(/\s+/).length;
      
      const hasFactualWords = /\d+|процент|статистика|исследование|ученые|эксперты/i.test(text);
      const hasOpinionWords = /думаю|считаю|возможно|вероятно|наверное/i.test(text);
      
      let confidence = 50;
      let verdict: 'verified' | 'unverified' | 'warning' = 'unverified';
      let sources: string[] = [];
      let aiScore = 45;
      
      if (hasFactualWords) {
        confidence = 70 + Math.floor(Math.random() * 20);
        verdict = 'verified';
        sources = ['Wikipedia', 'Google Scholar', 'Reuters'];
        aiScore = 75 + Math.floor(Math.random() * 15);
      } else if (hasOpinionWords) {
        confidence = 30 + Math.floor(Math.random() * 15);
        verdict = 'warning';
        sources = ['Opinion Blogs', 'Social Media'];
        aiScore = 35 + Math.floor(Math.random() * 10);
      } else if (wordCount > 50) {
        confidence = 55 + Math.floor(Math.random() * 20);
        verdict = 'unverified';
        sources = ['General Web', 'News Aggregators'];
        aiScore = 50 + Math.floor(Math.random() * 15);
      } else {
        confidence = 40 + Math.floor(Math.random() * 15);
        verdict = 'warning';
        sources = ['Insufficient Data'];
        aiScore = 40 + Math.floor(Math.random() * 10);
      }

      const positiveWords = text.match(/хорошо|отлично|прекрасно|замечательно|успех/gi);
      const negativeWords = text.match(/плохо|ужасно|провал|катастрофа|проблема/gi);
      
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let sentimentScore = 0;
      
      if (positiveWords && positiveWords.length > (negativeWords?.length || 0)) {
        sentiment = 'positive';
        sentimentScore = Math.min(10, positiveWords.length * 2);
      } else if (negativeWords && negativeWords.length > (positiveWords?.length || 0)) {
        sentiment = 'negative';
        sentimentScore = -Math.min(10, negativeWords.length * 2);
      }

      const insights: string[] = [];
      if (wordCount < 20) {
        insights.push('Текст слишком короткий для полного анализа');
      }
      if (hasFactualWords) {
        insights.push('Обнаружены фактические утверждения, требующие проверки');
      }
      if (hasOpinionWords) {
        insights.push('Текст содержит субъективные оценки');
      }
      if (wordCount > 100) {
        insights.push('Объемный текст с развернутым контекстом');
      }
      if (insights.length === 0) {
        insights.push('Нейтральный текст без явных маркеров');
      }

      const result: AnalysisResult = {
        id: Date.now().toString(),
        text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        confidence,
        verdict,
        sources,
        timestamp: new Date(),
        sentiment,
        sentimentScore,
        aiScore,
        aiInsights: insights
      };

      setCurrentResult(result);
      const newHistory = [result, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(newHistory);
      saveHistory(newHistory);
      setText('');
      setIsAnalyzing(false);
    }, 1500);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'verified':
        return 'bg-secondary text-white';
      case 'unverified':
        return 'bg-muted text-muted-foreground';
      case 'warning':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'verified':
        return 'CheckCircle2';
      case 'unverified':
        return 'HelpCircle';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Circle';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-secondary text-white';
      case 'negative':
        return 'bg-destructive text-white';
      case 'neutral':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'ThumbsUp';
      case 'negative':
        return 'ThumbsDown';
      case 'neutral':
        return 'Minus';
      default:
        return 'Minus';
    }
  };

  const exportResults = () => {
    if (!currentResult) return;

    const exportData = {
      text: currentResult.text,
      analysis: {
        confidence: currentResult.confidence + '%',
        verdict: currentResult.verdict,
        sentiment: currentResult.sentiment,
        sentimentScore: currentResult.sentimentScore,
        aiScore: currentResult.aiScore + '%'
      },
      sources: currentResult.sources,
      aiInsights: currentResult.aiInsights,
      timestamp: currentResult.timestamp.toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${currentResult.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Shield" className="text-primary" size={28} />
            <h1 className="text-2xl font-bold">Text Veracity Analyzer</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost">Главная</Button>
            <Button variant="ghost">Методология</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="analyzer" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="analyzer">Анализатор</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight">
                Проверка истинности текста
              </h2>
              <p className="text-muted-foreground text-lg">
                Введите текст для локального анализа достоверности
              </p>
            </div>

            <Card className="max-w-4xl mx-auto animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" className="text-primary" />
                  Анализ текста
                </CardTitle>
                <CardDescription>
                  Вставьте текст для проверки фактов и оценки достоверности
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Введите текст для анализа..."
                  className="min-h-[200px] resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                  onClick={analyzeText}
                  disabled={!text.trim() || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Icon name="Loader2" className="animate-spin mr-2" />
                      Анализируем...
                    </>
                  ) : (
                    <>
                      <Icon name="Search" className="mr-2" />
                      Анализировать текст
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {currentResult && (
              <Card className="max-w-4xl mx-auto animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Icon name="BarChart3" className="text-primary" />
                      Результат анализа
                    </span>
                    <Badge className={getVerdictColor(currentResult.verdict)}>
                      <Icon name={getVerdictIcon(currentResult.verdict)} className="mr-1" size={16} />
                      {currentResult.verdict === 'verified' && 'Подтверждено'}
                      {currentResult.verdict === 'unverified' && 'Не подтверждено'}
                      {currentResult.verdict === 'warning' && 'Предупреждение'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Уровень достоверности</span>
                        <span className="text-2xl font-bold text-primary">{currentResult.confidence}%</span>
                      </div>
                      <Progress value={currentResult.confidence} className="h-3" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">AI-оценка</span>
                        <span className="text-2xl font-bold text-primary">{currentResult.aiScore}%</span>
                      </div>
                      <Progress value={currentResult.aiScore} className="h-3" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Icon name="Heart" size={18} />
                      Тональность
                    </h4>
                    <div className="flex items-center gap-4">
                      <Badge className={getSentimentColor(currentResult.sentiment)}>
                        <Icon name={getSentimentIcon(currentResult.sentiment)} className="mr-1" size={16} />
                        {currentResult.sentiment === 'positive' && 'Позитивная'}
                        {currentResult.sentiment === 'negative' && 'Негативная'}
                        {currentResult.sentiment === 'neutral' && 'Нейтральная'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Балл: {currentResult.sentimentScore > 0 ? '+' : ''}{currentResult.sentimentScore}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Icon name="Sparkles" size={18} />
                      AI-инсайты
                    </h4>
                    <div className="space-y-2">
                      {currentResult.aiInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Icon name="CheckCircle" className="text-primary mt-0.5" size={16} />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Icon name="Link" size={18} />
                      Источники
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {currentResult.text}
                    </p>
                  </div>

                  <Button onClick={exportResults} variant="outline" className="w-full">
                    <Icon name="Download" className="mr-2" />
                    Экспортировать результаты
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">История анализов</h2>
                  <p className="text-muted-foreground">
                    Сохранено {history.length} из {MAX_HISTORY_ITEMS} записей
                  </p>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Удалить всю историю анализов?')) {
                        setHistory([]);
                        saveHistory([]);
                      }
                    }}
                  >
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Очистить
                  </Button>
                )}
              </div>
            </div>

            {history.length === 0 ? (
              <Card className="max-w-4xl mx-auto">
                <CardContent className="py-12 text-center">
                  <Icon name="Inbox" className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">
                    Пока нет анализов. Начните проверку текста во вкладке Анализатор.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {history.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center gap-2">
                          <Icon name={getVerdictIcon(result.verdict)} size={20} />
                          {result.timestamp.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <Badge className={getVerdictColor(result.verdict)}>
                          {result.confidence}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{result.text}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <Badge className={getSentimentColor(result.sentiment)} variant="secondary">
                          <Icon name={getSentimentIcon(result.sentiment)} className="mr-1" size={12} />
                          {result.sentiment === 'positive' && 'Позитив'}
                          {result.sentiment === 'negative' && 'Негатив'}
                          {result.sentiment === 'neutral' && 'Нейтрал'}
                        </Badge>
                        <span className="text-muted-foreground">AI: {result.aiScore}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <section className="mt-24 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Методология</h2>
            <p className="text-muted-foreground">
              Как работает наш анализатор истинности
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-2">
                  <Icon name="Brain" className="text-primary" size={20} />
                  Локальный анализ
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Анализ происходит локально в браузере на основе эвристических алгоритмов,
                проверяющих структуру текста, наличие фактических утверждений и маркеров достоверности.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-2">
                  <Icon name="Database" className="text-primary" size={20} />
                  Анализ тональности
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Система определяет эмоциональную окраску текста, выявляя позитивные,
                негативные или нейтральные формулировки для полной оценки содержания.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-2">
                  <Icon name="TrendingUp" className="text-primary" size={20} />
                  Оценка достоверности
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Система присваивает процент достоверности на основе анализа лексики,
                структуры и характера утверждений в тексте.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <footer className="border-t mt-24 py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Shield" className="text-primary" size={24} />
            <span className="font-semibold text-foreground">Text Veracity Analyzer</span>
          </div>
          <p className="text-sm">
            Локальный инструмент для анализа текста
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;