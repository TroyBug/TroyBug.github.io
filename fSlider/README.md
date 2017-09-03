# 基于jQuery的全屏轮播图插件

### html结构
```html
<div id="slider">
  <ul class="slider">
   <li><img src="1.jpg" alt=""></li>
   <li><img src="2.jpg" alt=""></li>
   <li><img src="3.jpg" alt=""></li>
  </ul>
  <div class="controllBtns"></div>
</div>
```

### 调用
```javascript
$('#slider').fullScreenSlider({
  speed: 3000,  //setInterval(optional)
  seamless:true,  //(optional)是否衔接滚动
  controller:'.controllBtns'  //控制器
});
