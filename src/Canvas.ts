import { Camera, Geometry, Mesh, OGLRenderingContext, Plane, Program, Renderer, Texture, Transform, Vec2 } from 'ogl-typescript';
import vertex from './shaders/vertex.glsl?raw';
import fragment from './shaders/fragment.glsl?raw';

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
    constructor(el: HTMLElement, params?: CanvasParams) {
        this.cursor = params?.cursor || { x: 0, y: 0 }
        this.el = el
        this.createRenderer()
        console.log('this.gl init', this.gl);
        this.camera = this.createCamera()
        this.scene = this.createScene()

        this.onResize()
        this.geometry = this.createGeometry()
        this.createMesh()

        this.show()
        document.addEventListener('mousemove', this.onMouseMove.bind(this))
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
                    value: new Vec2(this.cursor.x, this.cursor.y)
                },
                force: {
                    value: -1.0
                },
                radius: {
                    value: 0.5
                }
            }
        })

        this.mesh = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program
        })
        this.mesh.setParent(this.scene)
        this.mesh.rotation.x = -23 * Math.PI / 180;


        const bounds = this.el.getBoundingClientRect()

        this.boundDim = {
            width: bounds.width / this.screenAspectRatio.width,
            height: bounds.height / this.screenAspectRatio.height
        }
        this.mesh.scale.x = this.size.width * this.boundDim.width
        this.mesh.scale.y = this.size.height * this.boundDim.height

        this.mesh.position.x = (bounds.x + bounds.width / 2) * this.size.width / this.screenAspectRatio.width - this.size.width / 2
        this.mesh.position.y = 0

    }

    onMouseMove(e: MouseEvent) {
        if (!this.gl) return
        // console.log('thjis.gl', this.gl);
        // console.log(this.gl.canvas, this.gl.canvas.width);
        // console.log('onMove', e);
        const pixel = {
            x: e.x * this.gl.canvas.width / this.gl.canvas.clientWidth,
            y: e.y * this.gl.canvas.height / this.gl.canvas.clientHeight
        }
        this.cursor = {
            x: pixel.x * this.size.width / this.screenAspectRatio.width - this.size.width / 2,
            y: -pixel.y * this.size.height / this.screenAspectRatio.height + this.size.height / 2
        }
    }

    update() {
        const l = this.mesh.position.x
        const w = this.boundDim.width * this.size.width
        const h = this.boundDim.height * this.size.height
        // let x = this.map(this.cursor.x, l - w / 2, l + w / 2, -0.7, 0.7)
        let x = this.map(this.cursor.x, l - w / 2, l + w / 2, -0.5, 0.5)
        let y = this.map(this.cursor.y, -h / 2, h / 2, -0.5, 0.5)

        this.program.uniforms.target.value = [x, y]
        // console.log(this.cursor);
        // console.log('this.gl update', this.gl);
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