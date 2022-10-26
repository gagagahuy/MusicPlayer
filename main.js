const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const player = $('.player')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const btnNext = $('.btn-next')
const btnPrev = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const currentTime = $('.currentTime')
const durationTime = $('.druationTime')
const volumeBar = $('#volume')
const volumeIcon = $('.volume-change')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isMute: false,
    currentVolume: 0.0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {
        currentVolume: 0.5
    },
    songs: [
        {
            name: '白月光与朱砂痣',
            author: 'Đại Tử',
            image: './image/Suzy2.jpg',
            path: './music/BachNguyetQuangVaNotChuSa.mp3'
        },
        {
            name: 'Devil From Heaven',
            author: 'TVT remix',
            image: './img/AcMa.jfif',
            path: './music/Ac_ma_den_tu_thien_duong_TVT_Remix.mp3'
        },
        {
            name: 'Let\'s marriage',
            author: 'Masew ft. Masiu',
            image: './img/CuoiThoi.jpg',
            path: './music/Cuoi_Thoi_Masew_x_Masiu.mp3'
        },
        {
            name: 'Payphone',
            author: 'Alex G',
            image: './img/payphone.jfif',
            path: './music/Payphone_Alex_G.mp3'
        },
        {
            name: 'The Night',
            author: 'Avicill',
            image: './img/TheNight.jpg',
            path: './music/TheNight.mp3'
        },
        {
            name: 'Theres-No-One-At-All',
            author: 'Sơn Tùng MTP',
            image: './img/son-tung-m-tp.jpg ',
            path: './music/Theres-No-One-At-All-Son-Tung-M-TP.mp3'
        },
        {
            name: 'Waiting For You',
            author: 'MONO',
            image: './img/1660733423986.jpg',
            path: './music/Waiting For You.mp3'
        },
        {
            name: '3107',
            author: 'W/n, Duongg',
            image: './img/61b35411029c6156973232016738c1b7.jpg',
            path: './music/3107.mp3'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return ` 
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.author}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth
        //Handle cd play or pause
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        //Handle zooming cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        //Handling when pressing the play button
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        }
        //When the song is played
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            if (_this.isMute) {
                audio.volume = 0;
                volumeBar.value = 0;
            }
            else { 
                audio.volume = _this.currentVolume;
                volumeBar.value = _this.currentVolume * 100;
            }
        }
        //When the song is paused
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //When the song tempo changes
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                currentTime.textContent = _this.timeFormat(this.currentTime)
                durationTime.textContent = _this.timeFormat(this.duration)
            }
        }
        //Handle when rewinding song
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        //When click next button
        btnNext.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        //When click previous button
        btnPrev.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        //Handle when random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        //Handle next song when audio ended
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                btnNext.click();
            }
        }
        //Lắng nghe hành vi click vào playlist
        //target là trả về những cái mà mình ấn vào
        //Trả về phần từ hoặc cha nó nếu không thì nó sẽ trả về là null
        //xử lý khi nhấn vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const checkOption = e.target.closest('.option')
            if (songNode || checkOption) {
                if (songNode) {
                    // console.log(songNode.getAttribute('data-index'))
                    //c2
                    // console.log(songNode.dataset.index)
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if (checkOption) {

                }
            }
        }
        volumeIcon.onclick = function () {
            _this.isMute = !_this.isMute;
            _this.setConfig('isMute', _this.isMute);
            volumeIcon.classList.toggle('active', _this.isMute);
            if (_this.isMute) {
                volumeBar.value = 0;
                audio.volume = 0;
            }
            else {
                _this.isMute = false
                volumeBar.value = _this.currentVolume * 100;
                audio.volume = _this.currentVolume;
            }
        }
        volumeBar.onchange = function (e) {
            _this.currentVolume = e.target.value / 100;
            audio.volume = _this.currentVolume
            _this.setConfig('currentVolumn', _this.currentVolume)
            if (audio.volume === 0) {
                volumeIcon.classList.add('active')
            }
            else {
                _this.isMute = false;
                _this.setConfig('isMute', _this.isMute);
                volumeIcon.classList.remove('active')
            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            if (this.currentIndex === 0 || this.currentIndex === 1) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }
        }, 500)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.isMute = this.config.isMute
        this.currentVolume = this.config.currentVolume

        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom)
        volumeIcon.classList.toggle('active', this.isMute)
    },
    timeFormat(seconds) {
        const date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().slice(14, 19);
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            console.log(this.songs)
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong();
    },
    // when browser closed
    star: function () {
        //Cấu hình từ config vào ứng dụng
        this.loadConfig();
        //Define properties for the Object
        this.defineProperties();
        //Listen and handle events
        this.handEvents();
        this.loadCurrentSong();
        this.render();
    }
}
app.star();

