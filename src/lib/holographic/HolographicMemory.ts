import OpticalProcessor from '../optical/OpticalProcessor';

class HolographicMemory {
  private memoryPlates: Map<string, Float32Array>;
  private opticalProcessor: OpticalProcessor;
  
  constructor() {
    this.memoryPlates = new Map();
    this.opticalProcessor = new OpticalProcessor();
  }

  public store(pattern: string, data: Float32Array): void {
    if (!this.memoryPlates.has(pattern)) {
      this.memoryPlates.set(pattern, new Float32Array(data.length));
    }
    
    const plate = this.memoryPlates.get(pattern)!;
    const interference = this.opticalProcessor.computeInterference(
      plate,
      this.opticalProcessor.processWave(data)
    );
    
    this.memoryPlates.set(pattern, interference);
  }

  public recall(pattern: string): Float32Array | null {
    const plate = this.memoryPlates.get(pattern);
    if (!plate) return null;
    
    return this.opticalProcessor.processWave(plate);
  }
}

export default HolographicMemory;