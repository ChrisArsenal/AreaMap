// 模块及其依赖配置
require.config( {
    paths: {
        "jquery": "jquery/2.2.4/jquery",
        "threewapper": "three/threewapper",
        "dxfparserwapper": "dxfParser/dxfparserwapper",
        "OrbitControls": "three/OrbitControls",
        "threedxf": "threedxf/0.2.1.x/three-dxf"
    },
    shim : {
        "OrbitControls": [ "threewapper", "jquery" ],
        "threedxf": [ "OrbitControls", "dxfparserwapper" ]
    },
    waitSeconds: 150
} );

/**
 * @fileoverview
 *      入口文件
 * @link https://github.com/forwardNow/AreaMap
 * @author 吴钦飞
 */
define( [ "jquery", "./areamap/areaMap", "./areamap/alert" ], function ( $, AreaMap, Alert ) {
    "use strict";

    $( document ).ready( function () {

        var
            $areaMapControl = $( "#areaMapControl" )
        ;

        //判断当前浏览器是否支持WebSocket
        if ( ! window[ "WebSocket" ] ) {
            Alert.show( "请使用支持WebSocket的浏览器：IE10及以上，Firefox11及以上，Chrome16及以上。" );
            return;
        }


        $( "#areaMapProgress" )
            .addClass( "animated bounceInDown" )
            .show()
        ;


        // 初始化
        AreaMap.init( function () {
            $( "#areaMap" )
                .addClass( "animated bounceInDown" )
                .show()
            ;
            setTimeout( function () {
                $areaMapControl
                    .addClass( "animated bounceInUp" )
                    .show()
                ;
            }, 800 );
        } );

        $areaMapControl.on( "click", ".js--mediaBtn", function () {
            var
                $this = $( this ),
                webSocketInstance
            ;

            // 启动
            if ( $this.is( ".js--playBtn" ) ) {


                webSocketInstance = new WebSocket( AreaMap.Config.websocketUrl );

                $this.parent().data( "webSocketInstance", webSocketInstance );

                webSocketInstance.onerror = function () {
                    Alert.show( "WebSocket 连接发生错误！" );
                };
                webSocketInstance.onopen = function () {
                    console.info( 'WebSocket Connection Established' );
                };
                webSocketInstance.onmessage = function ( e ) {
                    var data = JSON.parse( e.data );
                    // 设置位置标签
                    AreaMap.setLocationTag( data );
                    console.info( data );
                };
                webSocketInstance.onclose = function () {
                    console.info( 'WebSocket Connection Closed' );
                };

                //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
                window.onbeforeunload = function () {
                    webSocketInstance && webSocketInstance.close();
                }
            }
            // 停止
            else {
                webSocketInstance = $this.parent().data( "webSocketInstance" );
                webSocketInstance.close();
            }

            $this.hide();
            $this.siblings( ".button-media" ).show();

        } );


    } );

} );