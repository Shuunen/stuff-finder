class AppLoader extends HTMLElement {
  get style () {
    return `
    .loader {
      z-index: var(--elevation-t-rex, 200);
    }
    .lds-dual-ring {
      display: inline-block;
      height: 6rem;
      width: 6rem;
    }
    .lds-dual-ring:after {
      animation: lds-dual-ring 1.2s linear infinite;
      border: .5rem solid var(--color-white, whitesmoke);
      border-color: var(--color-white, whitesmoke) transparent var(--color-white, whitesmoke) transparent;
      border-radius: 50%;
      content: " ";
      display: block;
      height: 5rem;
      width: 5rem;
    }
    @keyframes lds-dual-ring {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }`
  }

  constructor () {
    super()
    this._id = 'app-loader'
    this.els = {}
    this.on(`${this._id}--toggle`, this.toggle)
  }

  on (eventName, callback) {
    window.addEventListener(eventName, event => callback.bind(this)(event.detail))
  }

  toggle (active) {
    this.els.wrapper.classList.toggle('hidden', !active)
  }

  createWrapper () {
    const wrapper = document.createElement('div')
    wrapper.className = 'backdrop loader hidden'
    wrapper.innerHTML = '<div class="lds-dual-ring">.</div>'
    const style = document.createElement('style')
    style.innerHTML = this.style
    wrapper.appendChild(style)
    return wrapper
  }

  connectedCallback () {
    this.els.wrapper = this.createWrapper()
    this.parentNode.replaceChild(this.els.wrapper, this)
  }
}

window.customElements.define('app-loader', AppLoader)
