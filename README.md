# AreaMap

解析DXF，通过three.js显示2D图；将传过来坐标显示在2D图上。

## 1. 用途

在网页中，显示区域内 人的移动轨迹：

 * 区域以CAD图展示，导出的文件为 dxf文件
 * 请求 dxf文件，并解析为 three.js 可识别的 JS对象
 * 通过 three.js 将区域以 2D图 的形式展现在网页上
 * 通过 WebSocket 不断获取人的坐标，在2D图上将坐标标记出来，看起来就是移动的标记

## 2. 功能

 * 显示所有人的位置标签，并不断更新坐标
 * 预定义一组颜色，按顺序每人一种位置标签颜色
 * 开启以及停止WebSocket，即开始及暂停更新位置标签
 * 当人第一次出现或离开时，想服务器请求 ID到人名的映射表
 * 缩放功能：TODO
 * 定位某个人的轨迹（场景随着人的移动而移动）：TODO
 * 给指定的人的位置标签设置颜色：TODO

## 3. 说明

### 3.1 AreaMap/index.html


```
<!--
    data-font-url
        three.js用到的中文字体（微软雅黑粗体）json文件的URL

    data-dxf-file-url
        获取dxf文件的URL

    data-id-to-name-mapping-url
        获取id到name的映射表。
        后台返回的数据：（参考：JsonResult.java）
            {
                "success": Boolean,
                "data": {
                    "56789": "张三",
                    "56799": "李四",
                    ...
                }
            }

    data-websocket-url
        WebSocket 的 URL

    -->
    <div class="pku-area-map"
         id="areaMap"
         style="display: none;"

         data-font-url="./fonts/MicrosoftYaHei_Bold.json"
         data-dxf-file-url="./data/zhian-0719-21_LAYER_1.dxf"
         data-id-to-name-mapping-url="./data/idToNameMapping.json"
         data-websocket-url="ws://192.168.1.241:8080/LocalSense/localsense">
```

