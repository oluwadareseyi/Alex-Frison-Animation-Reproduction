import { Camera, Geometry, Mesh, OGLRenderingContext, Plane, Program, Renderer, Texture, Transform } from 'ogl-typescript';
import vertex from './shaders/vertex.glsl?raw';
import fragment from './shaders/fragment.glsl?raw';
import anime from 'animejs';

export interface Dimension {
    width: number,
    height: number
}
export interface Cursor {
    x: number,
    y: number
}
export interface CanvasParams {
    cursor: Cursor
}

export default class Canvas {
    renderer!: Renderer
    gl!: OGLRenderingContext
    camera: Camera
    scene: Transform
    screenAspectRatio!: Dimension
    size!: Dimension
    geometry: Geometry
    el: HTMLElement
    texture!: Texture
    program!: Program;
    mesh!: Mesh;
    boundDim!: Dimension;
    group!: Transform;
    image: any;
    cursor: { x: number; y: number; };
    falseDOM: any;
    FasleBounds: any;
    scale!: { x: number; y: number; };
    pos!: { x: number; y: number }
    d = {
        w: 2,
        h: 1.5
    }
    constructor(el: HTMLElement, params?: CanvasParams) {
        this.falseDOM = document.querySelector('.animationEnd__wrapper')!
        console.log(this.falseDOM);
        this.cursor = params?.cursor || { x: 3, y: 3 }
        this.el = el
        this.createRenderer()
        this.camera = this.createCamera()
        this.scene = this.createScene()

        this.onResize()
        this.geometry = this.createGeometry()
        this.createMesh()

        this.show()
        document.addEventListener('click', this.onMouseClick.bind(this))


    }


    createRenderer() {
        this.renderer = new Renderer({
            alpha: true
        })
        this.gl = this.renderer.gl

        document.body.appendChild(this.gl.canvas)
    }

    show() {
        this.renderer.render({
            camera: this.camera,
            scene: this.scene
        })
    }

    createCamera() {
        const c = new Camera(this.gl)
        c.position.z = 5
        return c
    }

    createScene() {
        return new Transform()
    }

    onResize() {
        const w = window.innerWidth,
            h = window.innerHeight;
        this.renderer.setSize(w, h)

        this.screenAspectRatio = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        this.camera.perspective({ aspect: this.screenAspectRatio.width / this.screenAspectRatio.height })
        const fov = this.camera.fov * Math.PI / 180,
            height = 2 * Math.tan(fov / 2) * this.camera.position.z,
            width = height * this.camera.aspect


        this.size = {
            height,
            width
        }
    }

    createGeometry() {
        return new Plane(this.gl, {
            heightSegments: 40,
            widthSegments: 40
        })
    }

    createMesh() {
        this.group = new Transform()


        this.texture = new Texture(this.gl)


        this.image = new window.Image();
        this.image.crossOrigin = 'anonymous'
        this.image.src = this.el.getAttribute('data-src')!

        this.image.onload = () => {
            this.texture.image = this.image
        }

        // const resolution = { value: new Vec2() }
        // resolution.value.set(this.gl.canvas.width, this.gl.canvas.height)
        this.program = new Program(this.gl, {
            fragment,
            vertex,
            uniforms: {
                tMap: {
                    value: this.texture
                },
                target: {
                    // value: new Vec2(this.cursor.x, this.cursor.y)
                    value: 1
                },
                force: {
                    value: .0
                },
                radius: {
                    value: 0.7
                },
                d: {
                    value: [this.d.w, this.d.h]
                }
            }
        })

        this.mesh = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program
        })
        this.mesh.setParent(this.scene)
        // this.mesh.rotation.x = -23 * Math.PI / 180;


        const bounds = this.el.getBoundingClientRect()

        this.boundDim = {
            width: bounds.width / this.screenAspectRatio.width,
            height: bounds.height / this.screenAspectRatio.height
        }
        this.mesh.scale.x = this.size.width * this.boundDim.width
        this.mesh.scale.y = this.size.height * this.boundDim.height

        this.mesh.position.x = (bounds.x + bounds.width / 2) * this.size.width / this.screenAspectRatio.width - this.size.width / 2
        this.mesh.position.y = (bounds.y - bounds.height / 2) * this.size.height / this.screenAspectRatio.height - this.size.height / 2

        this.FasleBounds = this.falseDOM.getBoundingClientRect()
        this.scale = {
            x: this.mesh.scale.x,
            y: this.mesh.scale.y
        }
        this.pos = {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
        }
    }

    onMouseClick() {

        console.log('this.program', this.program);
        const initScale = {
            x: this.mesh.scale.x,
            y: this.mesh.scale.y
        }
        const endScale = {
            x: this.FasleBounds.width * this.size.width / this.screenAspectRatio.width,
            y: this.FasleBounds.height * this.size.height / this.screenAspectRatio.height
        }
        const initPos = {
            x: this.pos.x,
            y: this.pos.y
        }
        const endPos = {
            x: (this.FasleBounds.x + this.FasleBounds.width / 2) * this.size.width / this.screenAspectRatio.width - this.size.width / 2,
            y: (this.FasleBounds.y + this.FasleBounds.height / 2) * this.size.height / this.screenAspectRatio.height - this.size.height / 2
        }
        console.log(this.FasleBounds);
        anime({
            targets: this.scale,
            x: [initScale.x, endScale.x],
            y: [initScale.y, endScale.y],
            easing: 'easeInSine',
            duration: 3000
        })
        anime({
            targets: this.pos,
            x: [initPos.x, endPos.x],
            y: [initPos.y, endPos.y],
            duration: 2000,
            easing: 'easeInOutSine'
        })

        let targetTL = anime.timeline({
            targets: this.program.uniforms.target,
            // easing: 'easeInOutSine',
        })
        targetTL.add({
            value: [1, 0.6],
            easing: 'easeInSine',
            duration: 600
        }).add({
            value: [0.6, -1],
            easing: 'easeOutQuint',
            duration: 4000
        }, 600)
        let forceTL = anime.timeline({
            targets: this.program.uniforms.force,
            duration: 600
        })
        forceTL.add({
            value: [0, 1.2],
            easing: 'easeInOutCubic',
            duration: 900
        }).add({
            value: [1.2, 0],
            easing: 'easeInOutSine',
            duration: 600
        }, 2000)


        const initD = {
            w: this.d.w,
            h: this.d.h
        }

        anime({
            targets: this.d,
            w: [initD.w, 1],
            h: [initD.h, this.FasleBounds.width / this.FasleBounds.height],
            duration: 3000,
            easing: 'easeInQuad'
        })
    }

    update() {
        // const l = this.mesh.position.x
        // const w = this.boundDim.width * this.size.width
        // const h = this.boundDim.height * this.size.height
        // let x = this.map(this.cursor.x, l - w / 2, l + w / 2, -0.5, 0.5)
        // let y = this.map(this.cursor.y, -h / 2, h / 2, -0.5, 0.5)

        // this.program.uniforms.target.value = [x, y]
        this.mesh.scale.x = this.scale.x
        this.mesh.scale.y = this.scale.y
        this.mesh.position.x = this.pos.x
        this.mesh.position.y = this.pos.y

        this.program.uniforms.d.value = [this.d.w, this.d.h]
        this.renderer.render({
            camera: this.camera,
            scene: this.scene
        })
    }

    lerp(xi: number, xf: number, x: number) {
        return xi + x * (xf - xi)
    }
    ilerp(x: number, xi: number, xf: number) {
        return (x - xi) / (xf - xi)
    }
    map(x: number, start1: number, end1: number, start2: number, end2: number) {
        return this.lerp(start2, end2, this.ilerp(x, start1, end1))
    }
}