import { HfInference } from '@huggingface/inference';

export class HuggingFaceClient {
  private client: HfInference;
  private model: string = 'facebook/opt-350m';

  constructor(token: string) {
    this.client = new HfInference(token);
  }

  public async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.textGeneration({
        model: this.model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.1,
        },
      });
      
      return response.generated_text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
}