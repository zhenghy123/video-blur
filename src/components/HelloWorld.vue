<template>
  <div class="hello">
    <!--canvas标签创建一个宽高均为500像素，背景为蓝色的矩形画布-->
    <div class="video-out-container">
      <!-- <canvas slot="canvas" id="webgl1" width="500" height="300" style="background-color:#eee"></canvas> -->
      <MyBox>
        <canvas slot="canvas" id="webgl" width="500" height="300" style="background-color:#eee"></canvas>
      </MyBox>
    </div>
    <!-- <button @click="videoPlay()">播放</button> -->
    <!-- <video ref="video" src="../static/v1.mp4" controls></video> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Provide } from 'vue-property-decorator'
import MyBox from './MyBox.vue'

@Component({
  components: { MyBox }
})
export default class HelloWorld extends Vue {
  @Provide() private video: any
  videoready: boolean = false

  mounted() {
    // this.initVideo()
  }

  videoPlay() {
    console.log(this.video)
    this.video.play()
  }
  initVideo() {
    let _this = this
    var canvas: any = document.getElementById('webgl1')
    var gl = canvas.getContext('webgl')

    // 创建视频
    var video: any = document.createElement('video')
    video.oncanplay = function() {
      console.log('video can play')
      _this.videoready = true
      _this.initVideoCanvas()
    }
    video.onerror = function(e: any) {
      console.log('video error', e)
    }
    // video.crossOrigin = 'anonymous'
    video.src = require('../static/11.mp4')
    video.controls = true
    _this.video = video
  }
  // 初始化动画
  initVideoCanvas() {
    let _this = this
    var canvas: any = document.getElementById('webgl1')
    var gl = canvas.getContext('webgl')

    var vertexShaderSource = `
    attribute vec2 pos;
    varying vec2 tx;
    varying vec4 v_color;
    void main() {
      gl_Position=vec4(pos.x*2.0-1.0,1.0-pos.y*2.0,0,1);
      tx=pos;
      v_color=gl_Position;
    }`

    // var vertexShaderSource = `
    //     // 优化后的高斯模糊
    //   uniform mat4 uMVPMatrix;
    //   attribute vec4 aPosition;
    //   attribute vec4 aTextureCoord;

    //   // 高斯算子左右偏移值，当偏移值为2时，高斯算子为5 x 5
    //   const int SHIFT_SIZE = 2;

    //   uniform highp float texelWidthOffset;
    //   uniform highp float texelHeightOffset;

    //   varying vec2 textureCoordinate;
    //   varying vec4 blurShiftCoordinates[SHIFT_SIZE];

    //   void main() {
    //       gl_Position = uMVPMatrix * aPosition;
    //       textureCoordinate = aTextureCoord.xy;
    //       // 偏移步距
    //       vec2 singleStepOffset = vec2(texelWidthOffset, texelHeightOffset);
    //       // 记录偏移坐标
    //       for (int i = 0; i < SHIFT_SIZE; i++) {
    //           blurShiftCoordinates[i] = vec4(textureCoordinate.xy - float(i + 1) * singleStepOffset,
    //                                         textureCoordinate.xy + float(i + 1) * singleStepOffset);
    //       }
    //   }
    //   `

    // var fragmentShaderSource1 = `precision mediump float;
    //     varying vec2 textureCoordinate;
    //     uniform sampler2D inputTexture;
    //     // 高斯算子左右偏移值，当偏移值为2时，高斯算子为5 x 5
    //     const int SHIFT_SIZE = 2;
    //     varying vec4 blurShiftCoordinates[SHIFT_SIZE];
    //     void main() {
    //         // 计算当前坐标的颜色值
    //         vec4 currentColor = texture2D(inputTexture, textureCoordinate);
    //         mediump vec3 sum = currentColor.rgb;
    //         // 计算偏移坐标的颜色值总和
    //         for (int i = 0; i < SHIFT_SIZE; i++) {
    //             sum += texture2D(inputTexture, blurShiftCoordinates[i].xy).rgb;
    //             sum += texture2D(inputTexture, blurShiftCoordinates[i].zw).rgb;
    //         }
    //         // 求出平均值
    //         gl_FragColor = vec4(sum * 1.0 / float(2 * SHIFT_SIZE + 1), currentColor.a);
    //     }`

    // fragment shader
    // var fragmentShaderSource1 =
    //   'precision mediump float;\n' +
    //   'varying vec2 v_TexCoord;\n' +
    //   'uniform sampler2D u_Sampler;\n' +
    //   'void main() {\n' +
    //   '   gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    //   '}\n'

    // 原始矩形（500,300）
    // 定义坐标（250,150,50,50）矩形，转换（500/2=250,300/2=150）=》{250/250=1,150/150=1}
    // *>1 x-1,y-1   <1 1-x,1-y  =1 0,0============>(1/2=0.5,1/2=0.5,50/250=0.2/2=0.1,50/150=0.333/2=0.166)

    // &&tx.x<0.6&&tx.y>0.5&&tx.y<0.666
    var fragmentShaderSource1 = `
    precision lowp float;
    uniform sampler2D texture;
    uniform float h;
    uniform float v;
    varying vec2 tx;
    varying vec4 v_color;
    void main() {
      if( 1.5<tx.x &&tx.x<0.7 && 0.5<tx.y && tx.y<0.7 ){
         vec4 sum =v_color;
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
        //横向高斯模糊
        // sum += texture2D( texture, vec2( tx.x - 4.0 * h, tx.y ) ) * (0.051/2.0);
        // sum += texture2D( texture, vec2( tx.x - 3.0 * h, tx.y ) ) * (0.0918/2.0);
        // sum += texture2D( texture, vec2( tx.x - 2.0 * h, tx.y ) ) * (0.12245/2.0);
        // sum += texture2D( texture, vec2( tx.x - 1.0 * h, tx.y ) ) * (0.1531/2.0);
        // sum += texture2D( texture, vec2( tx.x, tx.y ) ) * (0.1633/2.0);
        // sum += texture2D( texture, vec2( tx.x + 1.0 * h, tx.y ) ) * (0.1531/2.0);
        // sum += texture2D( texture, vec2( tx.x + 2.0 * h, tx.y ) ) * (0.12245/2.0);
        // sum += texture2D( texture, vec2( tx.x + 3.0 * h, tx.y ) ) * (0.0918/2.0);
        // sum += texture2D( texture, vec2( tx.x + 4.0 * h, tx.y ) ) * (0.051/2.0);
        gl_FragColor = sum;
      } else {
        gl_FragColor = texture2D(texture, tx);
      }
    }`

    //初始化着色器
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.shaderSource(fragmentShader, fragmentShaderSource1)
    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)

    var program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    //获取顶点着色器的位置变量pos
    var pos = gl.getAttribLocation(program, 'pos')
    console.log('aaaaaaaaa', program)
    //允许数据传递
    gl.enableVertexAttribArray(gl.getUniformLocation(program, 'tx'))

    //获取着色器
    gl.uniform1f(gl.getUniformLocation(program, 'v'), 10.0)
    gl.uniform1f(gl.getUniformLocation(program, 'h'), 10.0)

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

    function loop() {
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
<style scoped lang="scss">
.video-out-container {
  display: inline-block;
  position: relative;
}
</style>
