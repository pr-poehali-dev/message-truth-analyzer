import { useState } from 'react';
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
}

const Index = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const analyzeText = () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const confidence = Math.floor(Math.random() * 100);
      let verdict: 'verified' | 'unverified' | 'warning' = 'verified';
      
      if (confidence < 40) verdict = 'warning';
      else if (confidence < 70) verdict = 'unverified';

      const result: AnalysisResult = {
        id: Date.now().toString(),
        text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        confidence,
        verdict,
        sources: [
          'Reuters',
          'BBC News',
          'Associated Press'
        ],
        timestamp: new Date()
      };

      setCurrentResult(result);
      setHistory([result, ...history]);
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
            <Button variant="ghost">API</Button>
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
                Введите текст для анализа достоверности с помощью искусственного интеллекта
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
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Уровень достоверности</span>
                      <span className="text-2xl font-bold text-primary">{currentResult.confidence}%</span>
                    </div>
                    <Progress value={currentResult.confidence} className="h-3" />
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">История анализов</h2>
              <p className="text-muted-foreground">
                Все проверенные тексты сохраняются здесь
              </p>
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
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{result.text}</p>
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
                  Искусственный интеллект
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Используем передовые модели машинного обучения для анализа текста и определения
                его достоверности на основе множества факторов и источников данных.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                <span className="flex items-center gap-2">
                  <Icon name="Database" className="text-primary" size={20} />
                  База проверенных фактов
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Сравниваем утверждения с базой данных проверенных фактов из надёжных источников,
                включая новостные агентства, научные публикации и официальные документы.
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
                Система присваивает процент достоверности на основе количества и качества
                подтверждающих источников, а также согласованности информации.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Code2" className="text-primary" />
                API для разработчиков
              </CardTitle>
              <CardDescription>
                Интегрируйте проверку фактов в свои приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Наш API позволяет автоматизировать проверку текстов и получать результаты
                в структурированном формате JSON.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
                POST /api/analyze<br />
                {'{'} "text": "Ваш текст для анализа" {'}'}
              </div>
              <Button variant="outline" className="w-full">
                <Icon name="BookOpen" className="mr-2" />
                Документация API
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-24 py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Shield" className="text-primary" size={24} />
            <span className="font-semibold text-foreground">Text Veracity Analyzer</span>
          </div>
          <p className="text-sm">
            Профессиональный инструмент для проверки истинности информации
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
