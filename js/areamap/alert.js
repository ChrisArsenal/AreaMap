/**
 * @fileoverview 信息提示
 * @author 吴钦飞
 */
define( [ "jquery" ], function ( $ ) {
    "use strict";
    var
        Alert = {},
        namespace = "pkui.alert"
    ;

    /**
     * 默认参数
     */
    Alert.defaults = {
        template: '<div class="pku-alert pku-alert-warning fixed-top" role="alert"></div>',
        intervalHeight: 60
    };

    /**
     * 初始化
     * @private
     */
    Alert._init = function () {
        this._bind();
    };
    /**
     * 事件绑定
     * @private
     */
    Alert._bind = function () {
        // 当点击alert时，销毁掉该alert
        $( document ).on( "click." + namespace, ".pku-alert", function () {
            var
                $this = $( this )
            ;
            $this
                .fadeOut( 600 )
                .remove()
            ;
        } );
    };

    /**
     * 显示
     * @param msg {String}
     * @return {jQuery} 容器
     */
    Alert.show = function ( msg ) {
        var
            $container
        ;
        // 创建一个容器
        $container = this._create();

        // 填充信息
        $container.html( msg );

        return $container;
    };

    /**
     * 创建
     * @return {jQuery} 容器
     * @private
     */
    Alert._create = function () {
        var
            $container,
            currentAlertNum,
            $body = $( document.body )
        ;

        // 创建
        $container = $( this.defaults.template ).appendTo( $body );

        // 当前 alert 的个数
        currentAlertNum = $body.find( ".pku-alert.fixed-top" ).size();

        // 定位
        $container.animate( {
            "top": this.defaults.intervalHeight * ( currentAlertNum - 1 ) + "px"
        } );

        return $container;
    };

    // 初始化
    Alert._init();

    return Alert;
} );