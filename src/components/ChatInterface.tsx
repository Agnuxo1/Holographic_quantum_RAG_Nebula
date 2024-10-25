import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Brain, MessageSquare, FileQuestion } from 'lucide-react';
import { HolographicProcessor } from '../lib/holographic/HolographicProcessor';

interface ChatInterfaceProps {
  isDarkMode: boolean;
}

export function ChatInterface({ isDarkMode }: ChatInterfaceProps) {
  const [processor] = useState(() => new HolographicProcessor());
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      processor.processText(input);
      const response = processor.generateResponse(input);
      setResponse(response);
      setProgress(100);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  }, [input, processor]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    
    try {
      const text = await file.text();
      processor.processText(text);
      setProgress(100);
    } catch (error) {
      console.error('File processing error:', error);
    } finally {
      setLoading(false);
    }
  }, [processor]);

  return (
    <Card className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Quantum Holographic Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div>
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          />
          {loading && <Progress value={progress} className="mt-2" />}
        </div>

        <div className="flex-grow">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or ask a question..."
              className={`flex-grow ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
            <Button 
              onClick={handleSubmit}
              className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Process
            </Button>
          </div>
        </div>

        {response && (
          <Alert className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}>
            <AlertDescription>{response}</AlertDescription>
          </Alert>
        )}

        <div className="mt-auto">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            System Metrics:
            {processor.getMetrics().totalNodes} nodes |
            Coherence: {(processor.getMetrics().quantumMetrics.averageCoherence * 100).toFixed(1)}% |
            Processing Speed: {processor.getMetrics().quantumMetrics.processingSpeed.toFixed(0)} ops/s
          </div>
        </div>
      </CardContent>
    </Card>
  );
}