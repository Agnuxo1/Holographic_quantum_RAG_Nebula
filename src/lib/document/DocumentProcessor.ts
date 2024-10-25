import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const TEXTURE_SIZE = 4096;
const MAX_WORDS = 100000;
const MIN_SENTENCE_LENGTH = 5;
const MAX_SENTENCE_LENGTH = 15;

interface DocumentChunk {
  text: string;
  index: number;
  total: number;
}

interface ProcessingResult {
  success: boolean;
  message: string;
  chunks?: DocumentChunk[];
  wordStats?: WordData[];
  error?: string;
}

interface WordData {
  word: string;
  frequency: number;
  hue: number;
  saturation: number;
  nextWords: Map<string, number>;
  totalTransitions: number;
}

interface TransitionProbability {
  word: string;
  probability: number;
}

export class DocumentProcessor {
  private static words: Map<string, WordData> = new Map();
  private static processingQueue: DocumentChunk[] = [];
  private static isProcessing = false;

  private static async processPDF(file: File): Promise<ProcessingResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
        
        window.dispatchEvent(new CustomEvent('documentProcessingProgress', {
          detail: { progress: (i / pdf.numPages) * 100 }
        }));
      }
      
      const chunks = await this.createChunks(fullText);
      await this.processText(fullText);
      const wordStats = Array.from(this.words.values());
      
      return {
        success: true,
        message: 'PDF processed successfully',
        chunks,
        wordStats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process PDF',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async processText(text: string): Promise<void> {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];
      
      this.addWordTransition(currentWord, nextWord);
      
      if (i % 1000 === 0) {
        window.dispatchEvent(new CustomEvent('documentProcessingProgress', {
          detail: { progress: (i / words.length) * 100 }
        }));
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }

  private static addWordTransition(currentWord: string, nextWord: string): void {
    if (!this.words.has(currentWord)) {
      this.words.set(currentWord, {
        word: currentWord,
        frequency: 0,
        hue: Math.random(),
        saturation: 0.5 + Math.random() * 0.5,
        nextWords: new Map(),
        totalTransitions: 0
      });
    }

    const wordData = this.words.get(currentWord)!;
    wordData.frequency += 1;
    wordData.totalTransitions += 1;
    wordData.nextWords.set(nextWord, (wordData.nextWords.get(nextWord) || 0) + 1);
  }

  private static getNextWordProbabilities(currentWord: string): TransitionProbability[] {
    const wordData = this.words.get(currentWord);
    if (!wordData) return [];

    return Array.from(wordData.nextWords.entries())
      .map(([word, count]) => ({
        word,
        probability: count / wordData.totalTransitions
      }))
      .sort((a, b) => b.probability - a.probability);
  }

  public static generateResponse(input: string): string {
    const inputWords = input.toLowerCase().match(/\b\w+\b/g) || [];
    if (inputWords.length === 0) return '';

    // Add input to the model
    for (let i = 0; i < inputWords.length - 1; i++) {
      this.addWordTransition(inputWords[i], inputWords[i + 1]);
    }

    // Find a starting word from the input that exists in our model
    let currentWord = inputWords[inputWords.length - 1];
    if (!this.words.has(currentWord)) {
      currentWord = inputWords.find(word => this.words.has(word)) || 
                   Array.from(this.words.keys())[0];
    }

    // Generate response
    const response: string[] = [currentWord];
    const length = Math.floor(Math.random() * 
      (MAX_SENTENCE_LENGTH - MIN_SENTENCE_LENGTH + 1)) + MIN_SENTENCE_LENGTH;

    for (let i = 1; i < length; i++) {
      const probabilities = this.getNextWordProbabilities(currentWord);
      if (probabilities.length === 0) break;

      // Use weighted random selection
      const random = Math.random();
      let cumulativeProbability = 0;
      let nextWord = probabilities[0].word;

      for (const { word, probability } of probabilities) {
        cumulativeProbability += probability;
        if (random <= cumulativeProbability) {
          nextWord = word;
          break;
        }
      }

      response.push(nextWord);
      currentWord = nextWord;
    }

    return response.join(' ');
  }

  private static async createChunks(text: string): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 0;
    
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    for (const sentence of sentences) {
      const potentialChunk = currentChunk + sentence;
      
      if (this.countTokens(potentialChunk) > this.CHUNK_SIZE && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
          total: -1
        });
        currentChunk = sentence;
      } else {
        currentChunk = potentialChunk;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
        total: -1
      });
    }
    
    const total = chunks.length;
    chunks.forEach(chunk => chunk.total = total);
    
    return chunks;
  }

  public static async processDocument(file: File): Promise<ProcessingResult> {
    try {
      if (!file) {
        return {
          success: false,
          message: 'No file provided',
          error: 'File is required'
        };
      }

      let result: ProcessingResult;

      if (file.type === 'application/pdf') {
        result = await this.processPDF(file);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        const chunks = await this.createChunks(text);
        await this.processText(text);
        const wordStats = Array.from(this.words.values());
        result = {
          success: true,
          message: 'Text file processed successfully',
          chunks,
          wordStats
        };
      } else {
        return {
          success: false,
          message: 'Unsupported file type',
          error: `File type ${file.type} is not supported. Please use PDF or TXT files.`
        };
      }

      if (result.success && result.chunks) {
        this.processingQueue = [...result.chunks];
        if (!this.isProcessing) {
          this.processQueue();
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process document',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.processingQueue.length > 0) {
        const chunk = this.processingQueue[0];
        await this.processChunk(chunk);
        this.processingQueue.shift();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private static async processChunk(chunk: DocumentChunk): Promise<void> {
    try {
      const tokens = this.tokenizeText(chunk.text);
      const progress = ((chunk.index + 1) / chunk.total) * 100;
      const detail = {
        progress,
        currentChunk: chunk.index + 1,
        totalChunks: chunk.total,
        tokens: tokens.length
      };
      
      window.dispatchEvent(new CustomEvent('documentProcessingProgress', { detail }));
    } catch (error) {
      console.error('Chunk processing error:', error);
    }
  }

  public static tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private static countTokens(text: string): number {
    return this.tokenizeText(text).length;
  }

  public static getProcessingProgress(): number {
    if (this.processingQueue.length === 0) return 100;
    const firstChunk = this.processingQueue[0];
    return ((firstChunk.total - this.processingQueue.length) / firstChunk.total) * 100;
  }

  public static getWordStats(): WordData[] {
    return Array.from(this.words.values())
      .sort((a, b) => b.frequency - a.frequency);
  }
}