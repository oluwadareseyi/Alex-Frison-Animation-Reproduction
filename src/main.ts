import Canvas from './Canvas'
// import './style.css'

const image = document.querySelector('img')!
let canvas = new Canvas(image)

// canvas.show()

const update = () => {

  canvas.update()

  window.requestAnimationFrame(update)
}
update()

