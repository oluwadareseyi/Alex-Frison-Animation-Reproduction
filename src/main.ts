import Canvas from './Canvas'
import './style.css'
(_ => {
  "use strict";
  var e = navigator;
  const t = document;
  const p = /Mobi|Andrdoid|Tablet|iPad|iPhone/.test(e.userAgent) || "MacIntel" === e.platform && 1 < e.maxTouchPoints ? "mobile" : "desktop";

  if (p == 'mobile') {
    console.log('mobile');
    t.body.innerHTML = ''
    t.body.innerHTML = '<h1>This website was made for desktop experience</h1>'
    return
  }

  const image = document.querySelector('img')!
  let canvas = new Canvas(image)

  // canvas.show()

  const update = () => {

    canvas.update()

    window.requestAnimationFrame(update)
  }
  update()

})()