# responsive-webapp
[预览地址](https://jiangxin0816.github.io/responsive-webapp/dist/index.html)

项目实现了一个响应式全屏app，利用css媒体查询等实现了可以适配PC和移动端的功能。  在页面结构上采用事件发布订阅模式，使得各个组件功能相互独立，便于代码的阅读和维护。 在处理后台数据方面，使用ajax技术异步请求，并且采用数据加锁，避免重复请求，在请求事件触发时构造函数节流，使得页面性能得到优化。 
利用jQuery将请求得到的数据进行逻辑拆分和页面上的dom元素绑定。最后用webpack打包所有的js，css和静态资源模块，使页面进行的网络请求次数变得尽可能低，优化了页面性能。

## 技术栈
- JavaScript
- jQuery
- ajax
- webpack
