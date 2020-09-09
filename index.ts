interface Iopts {
  type?: string
  charset?: string
  async?: boolean
  attrs?: string
  text?: string
  setAttribute?: void
}

const load = (src: string, opts: Iopts, cb: any) => {
  const head = document.head || document.getElementsByTagName('head')[0]
  const script: HTMLScriptElement = document.createElement('script')

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  cb = cb || function() {}

  script.type = opts.type || 'text/javascript'
  script.charset = opts.charset || 'utf8'
  script.async = 'async' in opts ? !!opts.async : true
  script.src = src

  if (opts.attrs) {
    setAttributes(script, opts.attrs)
  }

  if (opts.text) {
    script.text = '' + opts.text
  }

  const onend = 'onload' in script ? stdOnEnd : ieOnEnd
  onend(script, cb)

  // some good legacy browsers (firefox) fail the 'in' detection above
  // so as a fallback we always set onload
  // old IE will ignore this and new IE will set onload
  if (!script.onload) {
    stdOnEnd(script, cb)
  }

  head.appendChild(script)
}

function setAttributes(script: any, attrs: any) {
  for (var attr in attrs) {
    script.setAttribute(attr, attrs[attr])
  }
}

function stdOnEnd(script: any, cb: any) {
  script.onload = function() {
    this.onerror = this.onload = null
    cb(null, script)
  }
  script.onerror = function() {
    // this.onload = null here is necessary
    // because even IE9 works not like others
    this.onerror = this.onload = null
    cb(new Error('Failed to load ' + this.src), script)
  }
}

function ieOnEnd(script: any, cb: any) {
  script.onreadystatechange = function() {
    if (this.readyState != 'complete' && this.readyState != 'loaded') return
    this.onreadystatechange = null
    cb(null, script) // there is no way to catch loading errors in IE8
  }
}

export default load
