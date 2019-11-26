<template>
  <div class="hello">
    <!--canvas标签创建一个宽高均为500像素，背景为蓝色的矩形画布-->
    <canvas id="canvas" width="500" height="300" style="background-color:#eee"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide } from 'vue-property-decorator'

@Component
export default class Demo1 extends Vue {
  @Provide() private video: any

  mounted() {
    this.initVideo()
  }

  videoPlay() {
    console.log(this.video)

    this.video.play()
  }
  initVideo() {
    var canvas: any = document.getElementById('canvas')
    var gl: any = canvas.getContext('webgl')

    // vertex shader
    var VERTEX_SHADER_SOURCE = `
        attribute vec3 a_position;
        attribute vec4 a_color;
        uniform  mat4  u_matrix;
        varying vec4 v_color;
        
        void main() {
          gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
          v_color = a_color;
        }
      `

    // fragment shader
    var FRAGMENT_SHADER_SOURCE = `
      precision mediump float;
      varying vec4 v_color;

      void main() {
          gl_FragColor = v_color; 
      }`

    //初始化着色器
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vertexShader, VERTEX_SHADER_SOURCE)
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SOURCE)
    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)

    // setup a GLSL program
    var program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    // gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // look up where the vertex data needs to go.
    var a_position = gl.getAttribLocation(program, 'a_position')
    var a_color = gl.getAttribLocation(program, 'a_color')
    // gl.uniformMatrix4fv(u_matrix, false, u_matrix)
    // var resolutionLocation = gl.getUniformLocation(program, 'a_position')
    // gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    // gl.bufferData(
    //   gl.ARRAY_BUFFER,
    //   new Float32Array([0, 0.3, -0.3, -0.3, 0.3, -0.3]),
    //   gl.STATIC_DRAW
    // )
    // gl.enableVertexAttribArray(a_position)
    gl.enableVertexAttribArray(a_color)
    gl.enableVertexAttribArray(a_position)
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 0, 0)
    gl.vertexAttribPointer(a_position, 4, gl.FLOAT, false, 0, 0)

    setColors(gl)
    function setColors(gl: any) {
      // Pick 2 random colors.
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          Math.random(),
          Math.random(),
          Math.random(),
          1,
          Math.random(),
          Math.random(),
          Math.random(),
          1,
          Math.random(),
          Math.random(),
          Math.random(),
          1,
          Math.random(),
          Math.random(),
          Math.random(),
          1,
          Math.random(),
          Math.random(),
          Math.random(),
          1,
          Math.random(),
          Math.random(),
          Math.random(),
          1
        ]),
        gl.STATIC_DRAW
      )
    }
    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}
</script>

<style scoped lang="scss">
</style>
