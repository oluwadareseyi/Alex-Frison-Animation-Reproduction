float io2(float t) {
    float p = 2.0 * t * t;
    return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}


attribute vec2 uv;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float target;
uniform float force;
uniform float radius;

varying vec2 vUv;

uniform vec2 d;

void main() {
    // float x = position.x - target.x;
    float l = abs(position.x - .5 * position.y - target);
    // float y = position.y - target.y;
    // float d = sqrt(x*x + y*y);
    // float z = (force - (io2(d/radius)*force)) * step(d ,radius) ;
    float z = (force - io2(l/radius) * force) * step(l,radius);
    gl_Position =  projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0); 
    vUv = (uv - .5)/d + .5;
}