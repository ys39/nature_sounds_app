// Web Audio APIの初期化
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext;
let activeSounds = {};

// オーディオコンテキストの初期化
function initAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

// 各自然音のジェネレーター
class SoundGenerator {
    constructor(type) {
        this.type = type;
        this.nodes = [];
        this.gainNode = null;
    }

    start() {
        const ctx = initAudioContext();
        this.gainNode = ctx.createGain();
        this.gainNode.gain.value = 0.5;

        switch(this.type) {
            case 'rain':
                this.createRainSound(ctx);
                break;
            case 'ocean':
                this.createOceanSound(ctx);
                break;
            case 'forest':
                this.createForestSound(ctx);
                break;
            case 'birds':
                this.createBirdsSound(ctx);
                break;
            case 'fire':
                this.createFireSound(ctx);
                break;
            case 'wind':
                this.createWindSound(ctx);
                break;
            case 'thunder':
                this.createThunderSound(ctx);
                break;
            case 'stream':
                this.createStreamSound(ctx);
                break;
        }

        this.gainNode.connect(ctx.destination);
    }

    createRainSound(ctx) {
        // ホワイトノイズで雨音を生成
        const bufferSize = 4096;
        const whiteNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
        whiteNoise.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        };

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        this.nodes.push(whiteNoise);
    }

    createOceanSound(ctx) {
        // 低周波のノイズで波音を生成
        const oscillator1 = ctx.createOscillator();
        const oscillator2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        oscillator1.type = 'sine';
        oscillator1.frequency.value = 0.5;
        oscillator2.type = 'sine';
        oscillator2.frequency.value = 0.3;

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const whiteNoise = ctx.createScriptProcessor(4096, 1, 1);
        whiteNoise.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.3;
            }
        };

        whiteNoise.connect(filter);
        oscillator1.connect(this.gainNode);
        oscillator2.connect(this.gainNode);
        filter.connect(this.gainNode);

        oscillator1.start();
        oscillator2.start();
        this.nodes.push(oscillator1, oscillator2, whiteNoise);
    }

    createForestSound(ctx) {
        // 低周波ノイズと環境音
        const whiteNoise = ctx.createScriptProcessor(4096, 1, 1);
        whiteNoise.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.2;
            }
        };

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        this.nodes.push(whiteNoise);
    }

    createBirdsSound(ctx) {
        // ランダムな高音でさえずりを模倣
        const createChirp = () => {
            const osc = ctx.createOscillator();
            const chirpGain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = 800 + Math.random() * 1200;

            chirpGain.gain.value = 0;
            chirpGain.gain.setValueAtTime(0, ctx.currentTime);
            chirpGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
            chirpGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

            osc.connect(chirpGain);
            chirpGain.connect(this.gainNode);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        };

        this.chirpInterval = setInterval(createChirp, 1000 + Math.random() * 2000);
    }

    createFireSound(ctx) {
        // ノイズとクラックリング音
        const whiteNoise = ctx.createScriptProcessor(4096, 1, 1);
        whiteNoise.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) {
                const random = Math.random();
                output[i] = random > 0.95 ? random : (Math.random() * 2 - 1) * 0.15;
            }
        };

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        this.nodes.push(whiteNoise);
    }

    createWindSound(ctx) {
        // 低周波のノイズ
        const whiteNoise = ctx.createScriptProcessor(4096, 1, 1);
        whiteNoise.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.4;
            }
        };

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 0.2;

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        oscillator.connect(this.gainNode);
        oscillator.start();
        this.nodes.push(whiteNoise, oscillator);
    }

    createThunderSound(ctx) {
        // 雨音 + 時々雷
        this.createRainSound(ctx);

        const createThunder = () => {
            const osc = ctx.createOscillator();
            const thunderGain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = 50;

            thunderGain.gain.value = 0;
            thunderGain.gain.setValueAtTime(0, ctx.currentTime);
            thunderGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.1);
            thunderGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

            osc.connect(thunderGain);
            thunderGain.connect(this.gainNode);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 2);
        };

        this.thunderInterval = setInterval(createThunder, 5000 + Math.random() * 10000);
    }

    createStreamSound(ctx) {
        // 高周波ノイズでせせらぎを表現
        const whiteNoise = ctx.createScriptProcessor(4096, 1, 1);
        whiteNoise.onaudioprocess = function(e) {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < 4096; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.3;
            }
        };

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;

        whiteNoise.connect(filter);
        filter.connect(this.gainNode);
        this.nodes.push(whiteNoise);
    }

    stop() {
        this.nodes.forEach(node => {
            try {
                if (node.stop) {
                    node.stop();
                }
                if (node.disconnect) {
                    node.disconnect();
                }
            } catch (e) {
                console.log('Error stopping node:', e);
            }
        });

        if (this.chirpInterval) {
            clearInterval(this.chirpInterval);
        }
        if (this.thunderInterval) {
            clearInterval(this.thunderInterval);
        }

        if (this.gainNode) {
            this.gainNode.disconnect();
        }

        this.nodes = [];
    }

    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = value;
        }
    }
}

// 再生ボタンのイベントリスナー
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const soundType = this.dataset.sound;
        const card = this.closest('.sound-card');

        if (activeSounds[soundType]) {
            // 停止
            activeSounds[soundType].stop();
            delete activeSounds[soundType];
            this.textContent = '再生';
            this.classList.remove('playing');
            card.classList.remove('playing');
        } else {
            // 再生
            const generator = new SoundGenerator(soundType);
            generator.start();
            activeSounds[soundType] = generator;

            // 音量を適用
            const volume = document.getElementById('volume').value / 100;
            generator.setVolume(volume);

            this.textContent = '停止';
            this.classList.add('playing');
            card.classList.add('playing');
        }
    });
});

// 音量コントロール
const volumeSlider = document.getElementById('volume');
const volumeValue = document.getElementById('volume-value');

volumeSlider.addEventListener('input', function() {
    const volume = this.value / 100;
    volumeValue.textContent = this.value + '%';

    // すべてのアクティブな音に音量を適用
    Object.values(activeSounds).forEach(generator => {
        generator.setVolume(volume);
    });
});

// すべて停止ボタン
document.getElementById('stop-all').addEventListener('click', function() {
    Object.keys(activeSounds).forEach(soundType => {
        activeSounds[soundType].stop();
        delete activeSounds[soundType];
    });

    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.textContent = '再生';
        btn.classList.remove('playing');
    });

    document.querySelectorAll('.sound-card').forEach(card => {
        card.classList.remove('playing');
    });
});

// カード全体をクリックしても再生/停止
document.querySelectorAll('.sound-card').forEach(card => {
    card.addEventListener('click', function() {
        const btn = this.querySelector('.play-btn');
        btn.click();
    });
});
