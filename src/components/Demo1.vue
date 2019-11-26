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
        attribute vec2 a_position;
        uniform vec2 u_resolution;
        void main() {
          // convert the rectangle from pixels to 0.0 to 1.0
          vec2 zeroToOne = a_position / u_resolution;

          // convert from 0->1 to 0->2
          vec2 zeroToTwo = zeroToOne * 2.0;

          // convert from 0->2 to -1->+1 (clipspace)
          vec2 clipSpace = zeroToTwo - 1.0;

          gl_Position = vec4(clipSpace, 0, 1);//底部
           gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);//顶部
        }
      `

    // fragment shader
    var FRAGMENT_SHADER_SOURCE = `void main() {
        gl_FragColor = vec4(0, 1, 0, 1);  // green
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
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // look up where the vertex data needs to go.
    // var positionLocation = gl.getAttribLocation(program, 'a_position')
    var resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(resolutionLocation)
    gl.vertexAttribPointer(resolutionLocation, 2, gl.FLOAT, false, 0, 0)

    // draw
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}
</script>

<style scoped lang="scss">
</style>
