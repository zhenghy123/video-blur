<template>
  <div class="hello">
    <!--canvas标签创建一个宽高均为500像素，背景为蓝色的矩形画布-->
    <canvas id="webgl" width="500" height="300" style="background-color:#eee"></canvas>
    <button @click="videoPlay()">播放</button>
    <video ref="video" src="./v1.mp4" controls></video>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Provide } from 'vue-property-decorator'

@Component
export default class HelloWorld extends Vue {
  @Provide() private video: any

  mounted() {
    this.initVideo()
  }

  videoPlay() {
    console.log(this.video)

    this.video.play()
  }
  initVideo() {
    var canvas: any = document.getElementById('webgl')
    var gl = canvas.getContext('webgl')
    ;(window as any).gl = gl

    // 创建视频
    // var video: any = document.createElement('video')
    var video: any = this.$refs.video

    var videoready = false
    video.loop = true
    video.oncanplay = function() {
      videoready = true
    }
    this.video = video

    // ------------平移矩阵法--------------
    // 创建平移矩阵(沿x轴平移-0.4)
    // 1   0   0  -0.4
    // 0   1   0    0
    // 0   0   1    0
    // 0   0   0    1
    // mat4 m4 = mat4(1,0,0,0,  0,1,0,0,  0,0,1,0,  -0.4,0,0,1);
    // 平移矩阵m4左乘顶点坐标(vec4类型数据可以理解为线性代数中的nx1矩阵，即列向量)
    // 逐顶点进行矩阵变换
    // gl_Position = m4*apos;

    // vec4前三个参数表示顶点坐标值xyz。
    var vertexShaderSource = `
    attribute vec4 a_Position;//顶点位置坐标
    attribute vec2 a_TexCoord;//纹理坐标
    // attribute vec4 apos;
    varying vec2 v_TexCoord;//插值后纹理坐标

    void main() {
      //顶点坐标apos赋值给内置变量gl_Position
      gl_Position = a_Position;
      //纹理坐标插值计算
      v_TexCoord = a_TexCoord;

      // 在顶点着色器中逐顶点沿着x轴平移-0.4
      // gl_Position=vec4(apos.x-0.4,apos.y,apos.z,1);
    }`

    // vec4()构造函数 前三个参数，表示颜色RGB值，最后一个参数是透明度A，在WebGL着色器中颜色值使用[0,1]区间表示。
    var fragmentShaderSource = `
    //所有float类型数据的精度是highp
    precision highp float;
    // 接收插值后的纹理坐标
    varying vec2 v_TexCoord;
    // 纹理图片像素数据
    uniform sampler2D u_Sampler;

    void main() {
      // 采集纹素，逐片元赋值像素值
      gl_FragColor = texture2D(u_Sampler,v_TexCoord);

      // gl_FragColor=vec4(1.0,0.0,0.0,1.0);//红色
    }`

    // 声明初始化着色器函数
    function initShader(
      gl: any,
      vertexShaderSource: any,
      fragShaderSource: any
    ): any {
      //创建顶点着色器对象
      var vertexShader: any = gl.createShader(gl.VERTEX_SHADER)
      //创建片元着色器对象
      var fragmentShader: any = gl.createShader(gl.FRAGMENT_SHADER)
      //引入顶点、片元着色器源代码
      gl.shaderSource(vertexShader, vertexShaderSource)
      gl.shaderSource(fragmentShader, fragShaderSource)
      //编译顶点、片元着色器
      gl.compileShader(vertexShader)
      gl.compileShader(fragmentShader)

      //创建程序对象program
      var program = gl.createProgram()
      //附着顶点着色器和片元着色器到program
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      //链接program
      gl.linkProgram(program)
      //使用program
      gl.useProgram(program)
      //返回程序program对象
      return program
    }

    //初始化着色器
    var program = initShader(gl, vertexShaderSource, fragmentShaderSource)

    /**
     * 四个顶点坐标数据data，z轴为零
     * 定义纹理贴图在WebGL坐标系中位置
     **/
    var data = new Float32Array([
      -0.5,
      0.5, //左上角——v0
      -0.5,
      -0.5, //左下角——v1
      0.5,
      0.5, //右上角——v2
      0.5,
      -0.5 //右下角——v3
    ])

    /**
     * 创建UV纹理坐标数据textureData
     **/
    var textureData = new Float32Array([
      0,
      1, //左上角——uv0
      0,
      0, //左下角——uv1
      1,
      1, //右上角——uv2
      1,
      0 //右下角——uv3
    ])

    var a_Position = gl.getAttribLocation(program, 'a_Position')
    var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord')
    var u_Sampler = gl.getUniformLocation(program, 'u_Sampler')

    /**
     * 加载纹理图像像素数据
     **/
    var image = new Image()
    image.src = '1.jpg' //设置图片路径
    image.onload = texture //图片加载成功后执行texture函数

    /**
     创建缓冲区textureBuffer，传入图片纹理数据，然后执行绘制方法drawArrays()
    **/
    function texture() {
      var texture = gl.createTexture() //创建纹理图像缓冲区
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true) //纹理图片上下反转
      gl.activeTexture(gl.TEXTURE0) //激活0号纹理单元TEXTURE0
      gl.bindTexture(gl.TEXTURE_2D, texture) //绑定纹理缓冲区
      //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      //设置纹理贴图填充方式(纹理贴图像素尺寸小于顶点绘制区域像素尺寸)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      //设置纹素格式，jpg格式对应gl.RGB
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
      gl.uniform1i(u_Sampler, 0) //纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
      // 进行绘制
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    // //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
    // var aposLocation = gl.getAttribLocation(program, 'apos')
    // //创建缓冲区对象
    // var buffer = gl.createBuffer()
    // //绑定缓冲区对象,激活buffer
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    // //顶点数组data数据传入缓冲区
    // gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    // //缓冲区中的数据按照一定的规律传递给位置变量apos,第二个参数2表达的意思是两个数组为一组, 8个元素也就是总共四组
    // //attribute vec4 apos;可以知道apos是vec4类型数据，也就是有四个参数的向量，这样的话缺少两个数值元素， 这种情况下，一般第三个代表z轴的坐标值默认为0.0，第四个参数默认为1.0
    // gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0)
    // //允许数据传递
    // gl.enableVertexAttribArray(aposLocation)

    // var texture = gl.createTexture()
    // gl.bindTexture(gl.TEXTURE_2D, texture)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // gl.activeTexture(gl.TEXTURE0)

    // gl.clear(gl.COLOR_BUFFER_BIT)
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)

    // /**执行绘制之前，一定要开启深度测试，以免颜色混乱**/
    // gl.enable(gl.DEPTH_TEST)

    // //开始绘制，显示器显示结果 API:https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/drawArrays
    // gl.drawArrays(gl.LINE_LOOP, 0, 4)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
