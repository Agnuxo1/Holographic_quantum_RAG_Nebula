import { Vector3, Color } from 'three';
import { ShaderMaterial } from 'three';

interface OpticalNeuronProps {
  position: Vector3;
  activation: number;
  wavelength: number;
}

class OpticalNeuron {
  private position: Vector3;
  private activation: number;
  private wavelength: number;
  private material: ShaderMaterial;

  constructor({ position, activation, wavelength }: OpticalNeuronProps) {
    this.position = position;
    this.activation = activation;
    this.wavelength = wavelength;
    this.material = this.createMaterial();
  }

  private createMaterial(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        activation: { value: this.activation },
        wavelength: { value: this.wavelength }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Add wave-like movement based on activation
          vec3 pos = position;
          float wave = sin(time * 2.0 + position.x * 4.0) * 0.1;
          pos.y += wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float activation;
        uniform float wavelength;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        vec3 wavelengthToColor(float wavelength) {
          // Simplified spectral color calculation
          vec3 color;
          if (wavelength >= 380.0 && wavelength < 440.0) {
            color = vec3(-(wavelength - 440.0) / 60.0, 0.0, 1.0);
          } else if (wavelength >= 440.0 && wavelength < 490.0) {
            color = vec3(0.0, (wavelength - 440.0) / 50.0, 1.0);
          } else if (wavelength >= 490.0 && wavelength < 510.0) {
            color = vec3(0.0, 1.0, -(wavelength - 510.0) / 20.0);
          } else if (wavelength >= 510.0 && wavelength < 580.0) {
            color = vec3((wavelength - 510.0) / 70.0, 1.0, 0.0);
          } else if (wavelength >= 580.0 && wavelength < 645.0) {
            color = vec3(1.0, -(wavelength - 645.0) / 65.0, 0.0);
          } else {
            color = vec3(1.0, 0.0, 0.0);
          }
          return color;
        }
        
        void main() {
          vec3 baseColor = wavelengthToColor(wavelength);
          vec3 finalColor = mix(vec3(0.1), baseColor, activation);
          
          // Add holographic interference pattern
          float pattern = sin(vUv.x * 20.0) * cos(vUv.y * 20.0) * 0.1;
          finalColor += vec3(pattern);
          
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `
    });
  }

  public update(time: number): void {
    this.material.uniforms.time.value = time;
  }

  public setActivation(value: number): void {
    this.activation = value;
    this.material.uniforms.activation.value = value;
  }

  public getMaterial(): ShaderMaterial {
    return this.material;
  }
}

export default OpticalNeuron;