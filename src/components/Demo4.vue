<template>
  <div class="demo4">
    <!--canvas标签创建一个宽高均为500像素，背景为蓝色的矩形画布-->
    <div class="canvas-container">
      <canvas id="webgl" width="500" height="300" style="background-color:#eee"></canvas>
      <VueDraggableResizable
        :w="boxWidth"
        :h="boxHeight"
        :parent="true"
        :active="true"
        :onDragStart="onDragStart"
        :onResizeStart="onResizeStart"
        @dragging="onDragging"
        @resizing="onResizing"
      ></VueDraggableResizable>
    </div>
    <button @click="videoPlay()">播放</button>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Provide } from 'vue-property-decorator'
import VueDraggableResizable from 'vue-draggable-resizable'

// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

@Component({
  components: { VueDraggableResizable }
})
export default class HelloWorld extends Vue {
  @Provide()
  video: any = null
  videoready: boolean = false

  // 截图框默认宽高
  boxHeight: number = 40
  boxWidth: number = 90

  // canvas宽高
  height: number = 300
  width: number = 500

  // 截图矿坐标范围
  txxMin: number = 0.5
  txxMax: number = 0.6
  txyMin: number = 0.5
  txyMax: number = 0.6

  mounted() {
    this.initVideo()
  }
  videoPlay() {
    this.video.play()
  }
  onDragStart(ev: any) {
    // console.log('onDragStart', ev)
  }
  onResizeStart(handle: any, ev: any) {
    console.log('onResizeStart', handle, ev)
  }
  onDragging(left: any, top: any) {
    console.log('onDragging', left, top)
    this.txxMin = Math.floor((left / this.width) * 1000) / 1000
    this.txyMin = Math.floor((top / this.height) * 1000) / 1000

    this.txxMax =
      Math.floor(((left + this.boxWidth) / this.width) * 1000) / 1000
    this.txyMax =
      Math.floor(((top + this.boxHeight) / this.height) * 1000) / 1000
  }
  onResizing(left: any, top: any, width: any, height: any) {
    console.log('onResizing', left, top, width, height)

    this.boxWidth = width
    this.boxHeight = height

    this.txxMin = Math.floor((left / this.width) * 1000) / 1000
    this.txyMin = Math.floor((top / this.height) * 1000) / 1000

    this.txxMax = Math.floor(((left + width) / this.width) * 1000) / 1000
    this.txyMax = Math.floor(((top + height) / this.height) * 1000) / 1000
  }

  initShader(gl: any, vertexShaderSource: any, fragmentShaderSource: any): any {
    //初始化着色器
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)

    return { vertexShader, fragmentShader }
  }

  // 初始化截图框坐标范围

  initBoxData() {
    this.txxMin = 0
    this.txyMin = 0

    this.txxMax =
      Math.floor(((this.txxMin + this.boxWidth) / this.width) * 1000) / 1000
    this.txyMax =
      Math.floor(((this.txyMin + this.boxHeight) / this.height) * 1000) / 1000
  }

  initProgram(gl: any, vertexShader: any, fragmentShader: any): any {
    let program: any = gl.createProgram()
    gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    return program
  }

  // 初始化视频
  initVideo() {
    let _this = this
    let canvas: any = document.getElementById('webgl')
    let gl = canvas.getContext('webgl')

    this.height = canvas.height
    this.width = canvas.width

    // 创建视频
    let video: any = document.createElement('video')
    video.oncanplay = function() {
      console.log('video can play')
      _this.videoready = true
      _this.initBoxData()
      _this.initVideoCanvas()
    }
    video.onerror = function(e: any) {
      console.log('video error', e)
    }
    video.src = require('../static/11.mp4')
    video.controls = true
    _this.video = video
  }

  // 初始化canvas
  initVideoCanvas() {
    let _this = this
    let canvas: any = document.getElementById('webgl')
    let gl: any = canvas.getContext('webgl')

    // let shader: any = null
    var vertexShaderSource = `
    attribute vec2 pos;
    varying vec2 tx;
    varying vec4 v_color;
    void main() {
      gl_Position=vec4(pos.x*2.0-1.0,1.0-pos.y*2.0,0,1);
      tx=pos;
      v_color=gl_Position;
    }`

    // &&tx.x<0.6&&tx.y>0.5&&tx.y<0.666
    var fragmentShaderSource = `
    precision lowp float;
    uniform sampler2D texture;
    uniform float h;
    uniform float v;
    uniform float txxMin;
    uniform float txxMax;
    uniform float txyMin;
    uniform float txyMax;
    varying vec2 tx;
    varying vec4 v_color;
    void main() {
      if( txxMin < tx.x && tx.x < txxMax && txyMin < tx.y && tx.y < txyMax ){
         vec4 sum =vec4(0,0.1,0,1);
        //纵向高斯模糊
        sum += texture2D( texture, vec2( tx.x, tx.y - 4.0 * v ) ) * (0.051/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y - 3.0 * v ) ) * (0.0918/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y - 2.0 * v ) ) * (0.12245/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y - 1.0 * v ) ) * (0.1531/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y ) ) * (0.1633/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y + 1.0 * v ) ) * (0.1531/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y + 2.0 * v ) ) * (0.12245/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y + 3.0 * v ) ) * (0.0918/2.0);
        sum += texture2D( texture, vec2( tx.x, tx.y + 4.0 * v ) ) * (0.051/2.0);
        gl_FragColor = sum;
      } else {
        gl_FragColor = texture2D(texture, tx);
      }
    }`
    let { vertexShader, fragmentShader } = this.initShader(
      gl,
      vertexShaderSource,
      fragmentShaderSource
    )
    console.log('---', vertexShader)

    let program = this.initProgram(gl, vertexShader, fragmentShader)

    //获取顶点着色器的位置变量pos
    var pos = gl.getAttribLocation(program, 'pos')
    console.log('aaaaaaaaa', program)
    //允许数据传递
    gl.enableVertexAttribArray(gl.getUniformLocation(program, 'tx'))

    //获取着色器
    gl.uniform1f(gl.getUniformLocation(program, 'v'), 10.0)
    gl.uniform1f(gl.getUniformLocation(program, 'h'), 10.0)
    gl.uniform1f(gl.getUniformLocation(program, 'txxMin'), _this.txxMin)
    gl.uniform1f(gl.getUniformLocation(program, 'txxMax'), _this.txxMax)
    gl.uniform1f(gl.getUniformLocation(program, 'txyMin'), _this.txyMin)
    gl.uniform1f(gl.getUniformLocation(program, 'txyMax'), _this.txyMax)

    //创建缓冲区对象
    //顶点缓冲
    var v_pos = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, v_pos)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      gl.STATIC_DRAW
    )
    //索引缓冲
    var i_pos = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, i_pos)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    )

    var texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.activeTexture(gl.TEXTURE0)

    // console.log('loop')
    function loop() {
      //获取着色器
      gl.uniform1f(gl.getUniformLocation(program, 'v'), 10.0)
      gl.uniform1f(gl.getUniformLocation(program, 'h'), 10.0)
      gl.uniform1f(gl.getUniformLocation(program, 'txxMin'), _this.txxMin)
      gl.uniform1f(gl.getUniformLocation(program, 'txxMax'), _this.txxMax)
      gl.uniform1f(gl.getUniformLocation(program, 'txyMin'), _this.txyMin)
      gl.uniform1f(gl.getUniformLocation(program, 'txyMax'), _this.txyMax)

      if (_this.videoready) {
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          _this.video
        )
        // gl.bindBuffer(gl.ARRAY_BUFFER, v_pos)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, i_pos)
        //缓冲区中的数据传递pos
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
        //开始绘制图形
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }
      window.requestAnimationFrame(loop)
    }

    loop()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}
.demo4 {
  .canvas-container {
    position: relative;
    height: 300px;
    width: 500px;
  }
}
</style>
