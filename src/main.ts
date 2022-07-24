import Canvas from './Canvas'
import './style.css'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  
`
const image = document.querySelector('img')!
let canvas = new Canvas(image)

// canvas.show()
console.log('canvas SHOW POST');

const update = () => {

  canvas.update()

  window.requestAnimationFrame(update)
}
update()

