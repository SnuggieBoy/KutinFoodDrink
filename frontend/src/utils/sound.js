// Web Audio API Sound Synthesizer (Không cần tải file âm thanh ngoài, chạy mượt mà trên mọi thiết bị)

class SoundFX {
  constructor() {
    this.ctx = null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Tiếng Ting Ting thanh thoát (khi có đơn mới / hoàn thành)
  playDingDong() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      
      // Tone 1
      const osc1 = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, now) // D5
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      osc1.connect(gain1)
      gain1.connect(this.ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.4)

      // Tone 2 (higher)
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, now + 0.15) // A5
      gain2.gain.setValueAtTime(0.35, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
      osc2.connect(gain2)
      gain2.connect(this.ctx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.7)
    } catch (e) {
      console.warn('Audio not allowed yet:', e)
    }
  }

  // Tiếng chuông reo "Kính koong" khi khách bấm Gọi Phục Vụ
  playBell() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const freqs = [784, 1046.5, 1318.5] // G5, C6, E6 chime

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)
        gain.gain.setValueAtTime(0.25, now + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.8)
      })
    } catch (e) {
      console.warn('Audio error:', e)
    }
  }

  // Tiếng tính tiền thành công "Cha-ching"
  playSuccess() {
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C major chord arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)
        gain.gain.setValueAtTime(0.2, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.3)
      })
    } catch (e) {
      console.warn('Audio error:', e)
    }
  }
}

export const sound = new SoundFX()
