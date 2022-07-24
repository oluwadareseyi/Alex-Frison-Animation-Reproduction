// attribute vec4 p;
// attribute vec2 t;
// uniform mat4 m;
// uniform vec2 o;
// uniform float q;
// uniform float r;
// varying vec2 v;

float io2(float t) {
    float p = 2.0 * t * t;
    return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}


attribute vec2 uv;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 target;
uniform float force;
uniform float radius;

varying vec2 vUv;

void main() {
    // float x = p.x - o.x;
    // float y = p.y - o.y;
    // float d = sqrt(x * x + y * y);
    // float z = (q - (io2(d / r) * q)) * step(d, r);
    // gl_Position = m * vec4(p.x, p.y, z, 1.0);
    // v = t;
    // v = t;

    float x = position.x - target.x;
    float y = position.y - target.y;
    float d = sqrt(x*x + y*y);
    float z = (force - (io2(d/radius)*force)) * step(d, radius);

    gl_Position =  projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0); 
    vUv = uv;
}