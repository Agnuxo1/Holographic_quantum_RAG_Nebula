import { Vector3 } from 'three';

export class Complex {
  constructor(public real: number, public imag: number) {}

  add(other: Complex): Complex {
    return new Complex(
      this.real + other.real,
      this.imag + other.imag
    );
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  scale(factor: number): Complex {
    return new Complex(this.real * factor, this.imag * factor);
  }

  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(
      r * Math.cos(theta),
      r * Math.sin(theta)
    );
  }
}

export class Matrix4x4 {
  private data: number[][];

  constructor() {
    this.data = Array(4).fill(0).map(() => Array(4).fill(0));
  }

  multiply(other: Matrix4x4): Matrix4x4 {
    const result = new Matrix4x4();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  set(row: number, col: number, value: number): void {
    this.data[row][col] = value;
  }

  get(row: number, col: number): number {
    return this.data[row][col];
  }
}

export const QUANTUM_CONSTANTS = {
  PLANCK: 6.62607015e-34,
  REDUCED_PLANCK: 1.054571817e-34,
  LIGHT_SPEED: 299792458,
  BOLTZMANN: 1.380649e-23,
  FINE_STRUCTURE: 7.297352569e-3,
  COMPTON_WAVELENGTH: 2.42631023867e-12,
  RYDBERG: 10973731.568539,
  QUANTUM_CHROMODYNAMICS_SCALE: 217e-3,
  PHOTON_INTERACTION_STRENGTH: 1.0 / 137.036,
};