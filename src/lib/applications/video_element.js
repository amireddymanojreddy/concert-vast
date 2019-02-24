import QuartileSupport from '../quartile_support'

const EVENT_MAPPING = {
  muted: 'mute',
  pause: 'pause',
}

const VIDEO_CONTROLS_HEIGHT = 50

export default class VideoElement {
  constructor() {
    this.videoElement = null
    this.vast = null
    this.previousVolume = 0
    this._vastPresented = null
  }

  applyAsPreroll({ vast, videoElement }) {
    this.vast = vast
    this.videoElement = videoElement
    this.previousVolume = this.videoElement.volume
    this.quartileSupport = new QuartileSupport()
    this._vastPresented = true

    this.pauseExistingVideoSources()
    this.setupQuartileSupport()
    this.setupVideoEventListeners()
    this.setupImpressions()
    this.loadVastVideo()
  }

  applyAsPrimary({ vast, videoElement }) {
    applyAsPreroll({ vast, videoElement })
  }

  // private

  pauseExistingVideoSources() {
    Array.from(this.videoElement.querySelectorAll('source')).forEach(n => {
      n.setAttribute('vast-delayed-src', n.getAttribute('src'))
      n.setAttribute('src', null)
    })
  }

  setupVideoEventListeners() {
    // handle mute support
    this.videoElement.addEventListener(
      'volumechange',
      this.muteObserver.bind(this)
    )

    for (const nativeEventName in EVENT_MAPPING) {
      this.videoElement.addEventListener(nativeEventName, () => {
        if (!this.vastPresented()) return
        this.vast.addImpressionTrackingImagesFor(EVENT_MAPPING[nativeEventName])
      })
    }

    this.videoElement.addEventListener('timeupdate', () => {
      if (!this.vastPresented()) return
      this.quartileSupport.setCurrentTime(this.videoElement.currentTime)
    })

    this.videoElement.addEventListener('click', this.clickObserver.bind(this))

    this.videoElement.addEventListener(
      'loadedmetadata',
      this.updateQuartileDuration.bind(this)
    )
    this.videoElement.addEventListener(
      'durationchange',
      this.updateQuartileDuration.bind(this)
    )

    document.addEventListener('fullscreenchange', this.fullscreenObserver)
    document.addEventListener('webkitfullscreenchange', this.fullscreenObserver)
  }

  loadVastVideo() {
    const bestVideo = this.vast.bestVideo({
      height: videoElement.clientHeight,
      width: videoElement.clientWidth,
    })
    const videoSource = document.createElement('source')

    videoSource.setAttribute('src', bestVideo.url())
    videoSource.setAttribute('type', bestVideo.mimeType())
    this.videoElement.appendChild(videoSource)
    this.videoElement.load()
  }

  updateQuartileDuration() {
    this.quartileSupport.setDuration(this.videoElement.duration)
  }

  setupImpressions() {
    this.vast.addImpressionUrls()
  }

  muteObserver() {
    if (!this.vastPresented()) return

    if (this.previousVolume <= 0 && this.videoElement.volume != 0) {
      this.vast.addImpressionTrackingImagesFor('unmute')
    } else if (
      (this.previousVolume > 0 && this.videoElement.volume == 0) ||
      this.videoElement.muted
    ) {
      this.vast.addImpressionTrackingImagesFor('mute')
    }
    this.previousVolume = this.videoElement.muted
      ? -1
      : this.videoElement.volume
  }

  clickObserver(clickEvent) {
    if (!this.vastPresented()) return

    const element = clickEvent.target
    if (element) {
      const height = element.clientHeight
      if (clickEvent.offsetY <= height - 50 && this.isBeyondFirstFrame()) {
        this.vast.openClickthroughUrl()
      }
    }
  }

  fullscreenObserver(fullscreenEvent) {
    if (!this.vastPresented()) return
    if (document.fullscreenElement || document.webkitIsFullScreen) {
      this.vast.addImpressionTrackingImagesFor('fullscreen')
    }
  }

  setupQuartileSupport() {
    this.quartileSupport.onQuartileChange(quartile => {
      if (!this.vastPresented()) return
      this.vast.addImpressionTrackingImagesFor(quartile)
    })
  }

  isBeyondFirstFrame() {
    return this.videoElement.currentTime > 0
  }

  vastPresented() {
    return this._vastPresented
  }
}
